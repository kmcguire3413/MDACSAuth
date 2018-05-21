using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using MDACS.Server;
using System.Security.Cryptography;
using MDACS.API.Responses;
using MDACS.API.Requests;
using Newtonsoft.Json;
using System.Text;
using static MDACS.API.Auth;
using System.Reflection;
using Newtonsoft.Json.Linq;

namespace MDACS.Auth
{
    static class Handlers
    {
        public static async Task<Task> Verify(
            ServerState state, 
            HTTPRequest request, 
            Stream body, 
            IProxyHTTPEncoder encoder)
        {
            var req = await Util.ReadJsonObjectFromStreamAsync<AuthVerifyRequest>(body, 1024 * 1024);

            var user = state.Verify(req.challenge, req.hash);

            if (user == null)
                return await encoder.Response(403, "Verification of who you are failed.").SendNothing();

            var resp = new AuthCheckResponse()
            {
                payload = "",
                success = true,
                user = user,
            };

            return await encoder.Response(200, "OK").ContentType_JSON().SendJsonFromObject(resp);
        }

        public static async Task<Task> VerifyPayload(
            ServerState state,
            HTTPRequest request,
            Stream body,
            IProxyHTTPEncoder encoder)
        {
            var req = await Util.ReadJsonObjectFromStreamAsync<AuthVerifyPayloadRequest>(body, 1024 * 1024);

            var user = state.VerifyPayload(req.challenge, req.chash, req.phash);

            if (user == null)
                return await encoder.Response(403, "Authentication based on user failed.").SendNothing();

            var resp = new AuthCheckResponse()
            {
                payload = "",
                success = true,
                user = user,
            };

            return await encoder.Response(200, "OK").ContentType_JSON().SendJsonFromObject(resp);
        }

        public static async Task<Task> UserSet(
            ServerState state,
            HTTPRequest request,
            Stream body,
            IProxyHTTPEncoder encoder)
        {
            var msg = await Util.ReadJsonObjectFromStreamAsync<Msg>(body, 1024);
            var (user, req) = state.AuthenticateMessage<AuthUserSetRequest>(msg);

            if (user == null)
            {
                return await encoder.Response(403, "Authentication based on user failed.")
                    .ContentType("text/plain")
                    .CacheControlDoNotCache()
                    .SendNothing();
            }

            if (!user.admin && user.user != req.user.user)
            {
                return await encoder.Response(403, "Disallowed modification of another user.")
                    .ContentType("text/plain")
                    .CacheControlDoNotCache()
                    .SendNothing();
            }

            if (!await state.SetUser(req.user))
            {
                return await encoder.Response(500, "The set user command failed to execute.")
                    .ContentType("text/plain")
                    .CacheControlDoNotCache()
                    .SendNothing();
            }

            return await encoder.Response(200, "OK")
                .ContentType("text/plain")
                .CacheControlDoNotCache()
                .SendNothing();
        }

        public static async Task<Task> UserDelete(
            ServerState state,
            HTTPRequest request,
            Stream body,
            IProxyHTTPEncoder encoder)
        {
            var msg = await Util.ReadJsonObjectFromStreamAsync<Msg>(body, 1024);
            var (user, req) = state.AuthenticateMessage<AuthUserDeleteRequest>(msg);

            if (user == null)
            {
                return await encoder.Response(403, "Authentication failed for the user used.")
                    .ContentType("text/plain")
                    .CacheControlDoNotCache()
                    .SendNothing();
            }

            if (!user.admin)
            {
                return await encoder.Response(403, "Disallowed delete of user by non-administrator.")
                    .ContentType("text/plain")
                    .CacheControlDoNotCache()
                    .SendNothing();
            }

            if (!await state.DeleteUser(req.username))
            {
                return await encoder.Response(500, "The delete user command failed on the server.")
                    .ContentType("text/plain")
                    .CacheControlDoNotCache()
                    .SendNothing();
            }

            return await encoder.Response(200, "OK")
                .ContentType("text/plain")
                .CacheControlDoNotCache()
                .SendNothing();
        }

        public static async Task<Task> Challenge(
            ServerState state,
            HTTPRequest request,
            Stream body,
            IProxyHTTPEncoder encoder)
        {
            await Util.ReadStreamUntilEndAndDiscardDataAsync(body);

            var challenge = state.GetChallenge();

            return await encoder.Response(200, "OK")
                .ContentType_JSON()
                .SendString(
                    JsonConvert.SerializeObject(new AuthChallengeResponse()
                    {
                        challenge = challenge,
                    }
                )
            );
        }

        class InternalVersonInfo
        {
            public string version;
        }

        public static async Task<Task> UserList(
            ServerState state,
            HTTPRequest request,
            Stream body,
            IProxyHTTPEncoder encoder)
        {
            var msg = await Util.ReadJsonObjectFromStreamAsync<Msg>(body, 1024);
            var (user, req) = state.AuthenticateMessage<JObject>(msg);

            if (user == null)
            {
                return await encoder.Response(403, "The user list request was denied due to an authentication failure.")
                    .ContentType("text/plain")
                    .CacheControlDoNotCache()
                    .SendNothing();
            }
            

            var users = state.GetUserList();

            return await encoder.Response(200, "OK")
                .ContentType_JSON()
                .SendJsonFromObject(state.GetUserList());
        }

        public static async Task<Task> IsLoginValid(
            ServerState state,
            HTTPRequest request,
            Stream body,
            IProxyHTTPEncoder encoder)
        {
            var msg = await Util.ReadJsonObjectFromStreamAsync<Msg>(body, 1024);

            bool valid = false;

            User user;

            if (msg.payload == null || msg.auth.hash == null)
            {
                // Ensure the payload can never be accidentally used since this
                // authentication is without a payload hash.
                msg.payload = null;

                user = state.Verify(msg.auth.challenge, msg.auth.chash);

                if (user != null)
                {
                    valid = true;
                }
            } else
            {
                var payload_hash = BitConverter.ToString(
                        new SHA512Managed().ComputeHash(
                            Encoding.UTF8.GetBytes(msg.payload)
                        )
                    ).Replace("-", "").ToLower();

                user = state.VerifyPayload(
                    msg.auth.challenge,
                    msg.auth.chash,
                    payload_hash /* recompute it */
                );

                if (user != null)
                {
                    valid = true;
                }
            }

            if (valid)
            {
                return await encoder.Response(200, "Login Valid")
                    .CacheControlDoNotCache()
                    .ContentType_JSON()
                    .SendJsonFromObject(new AuthLoginValidResponse()
                    {
                        success = true,
                        user = user,
                    });
            } else
            {
                return await encoder.Response(403, "The login was not valid.")
                    .CacheControlDoNotCache()
                    .ContentType_JSON()
                    .SendJsonFromObject(new AuthLoginValidResponse()
                    {
                        success = false,
                        user = null,
                    });
            }
        }
    }

    class ServerState
    {
        public string dataBasePath;
        public RandomNumberGenerator crng;
        Queue<string> challenges;
        Dictionary<string, User> users;
        int maximumChallengesOutstanding;


        public ServerState(
            string dataBasePath,
            int maximumChallengesOutstanding
        )
        {
            this.dataBasePath = dataBasePath;
            this.maximumChallengesOutstanding = maximumChallengesOutstanding;

            crng = RandomNumberGenerator.Create();
            challenges = new Queue<string>();

            var users_file_path = Path.Combine(dataBasePath, "users.json");

            if (!File.Exists(users_file_path))
            {
                Console.WriteLine($"Creating users.json at location {dataBasePath}.");

                var defusrdata = new Dictionary<string, User>();

                File.WriteAllText(users_file_path, JsonConvert.SerializeObject(defusrdata));
            }

            Console.WriteLine($"Loading users.json from {dataBasePath}.");

            try
            {
                this.users = 
                    JsonConvert.DeserializeObject<
                        Dictionary<string, User>
                    >(File.ReadAllText(users_file_path));
            } catch (JsonSerializationException ex)
            {
                Console.WriteLine($"An exception happened during deserialization of the users.json file:\n\n{ex.ToString()}");
                throw;
            }

            string pwhash = "abc";

            {
                var hasher = new SHA512Managed();

                pwhash = BitConverter.ToString(
                    hasher.ComputeHash(Encoding.UTF8.GetBytes(pwhash))
                ).Replace("-", "").ToLower();
            }

            //foreach (var user in this.users)
            //{
                // Set password for everyone to abc.
                //user.Value.hash = pwhash;
            //}

            // Always ensure at last one user remains. This is the default
            // administrator user.
            if (this.users.Count == 0)
            {
                Console.WriteLine(
                    "Created default admin user because users.json was empty or non-existant."
                );

                this.users.Add("admin", new User()
                {
                    admin = true,
                    can_delete = true,
                    hash = pwhash,
                    name = "Default Administrator User",
                    user = "admin",
                    userfilter = null,
                });

                this.users.Add("apple", new User()
                {
                    admin = false,
                    can_delete = false,
                    hash = pwhash,
                    name = "Apple User",
                    user = "apple",
                    userfilter = null,
                });                

                this.FlushUsersToDisk().Wait();
            }
        }

        public async Task<bool> FlushUsersToDisk()
        {
            var users_file_path = Path.Combine(this.dataBasePath, "users.json");

            var fp = new StreamWriter(File.Open(users_file_path, FileMode.Create));

            await fp.WriteAsync(JsonConvert.SerializeObject(this.users));

            fp.Dispose();

            return true;
            
        }

        public async Task<bool> DeleteUser(string username)
        {
            if (this.users.ContainsKey(username))
            {
                this.users.Remove(username);

                await FlushUsersToDisk();
                return true;
            }

            return false;
        }

        public async Task<bool> SetUser(User user)
        {
            if (user.user.Length < 1)
            {
                return false;
            }

            if (user.name != null && user.name.Length == 0)
                user.name = null;

            if (user.userfilter != null && user.userfilter.Length == 0)
                user.userfilter = null;

            if (this.users.ContainsKey(user.user))
            {
                // Copy the hash if one was not specified.
                if (user.hash == null || user.hash.Length == 0)
                {
                    user.hash = this.users[user.user].hash;
                }

                this.users[user.user] = user;
            }
            else
            {
                this.users.Add(user.user, user);
            }

            await FlushUsersToDisk();

            return true;
        }

        /// <summary>
        /// Returns a copy of the user list and excludes the hash to prevent accidental disclosure
        /// of the hash to an attacker further in the application logic.
        /// </summary>
        /// <returns>A copy of the user list without the user password hash.</returns>
        public List<User> GetUserList()
        {
            var users_copy = new List<User>();

            foreach (var (k, user) in users)
            {
                var cuser = new User()
                {
                    admin = user.admin,
                    can_delete = user.can_delete,
                    hash = null,
                    name = user.name,
                    user = user.user,
                    phone = user.phone,
                    email = user.email,
                    userfilter = user.userfilter
                };

                users_copy.Add(cuser);
            }

            return users_copy;
        }

        public (User, T) AuthenticateMessage<T>(Msg msg)
        {
            User user;

            if (msg.payload == null || msg.auth.hash == null)
            {
                // Ensure the payload can never be accidentally used since this
                // authentication is without a payload hash.
                msg.payload = null;

                user = Verify(msg.auth.challenge, msg.auth.chash);
            }
            else
            {
                var payload_hash = BitConverter.ToString(
                        new SHA512Managed().ComputeHash(
                            Encoding.UTF8.GetBytes(msg.payload)
                        )
                    ).Replace("-", "").ToLower();

                user = VerifyPayload(
                    msg.auth.challenge,
                    msg.auth.chash,
                    payload_hash /* recompute it */
                );
            }

            if (user == null)
            {
                return (null, default(T));
            }

            var ret = JsonConvert.DeserializeObject<T>(msg.payload);

            return (user, ret);
        }

        /*
            Hire expert crytographer to rework or verify if software produces
            profit. Thus, until then it only needs to serve as a thwart or a
            reasonable answer for a small risk.
        */
        public User VerifyPayload(string challenge, string chash, string phash)
        {
            if (!UseChallenge(challenge))
            {
                return null;
            }

            foreach (var (k, user) in users)
            {
                var test_string = $"{phash}{challenge}{user.user}{user.hash}";
                var test_bytes = Encoding.UTF8.GetBytes(test_string);
                var hasher = new SHA512Managed();
                var result_hash =
                    BitConverter.ToString(
                        hasher.ComputeHash(test_bytes)
                    ).Replace("-", "").ToLower();

                if (result_hash.Equals(chash))
                {
                    return user;
                }
            }

            return null;
        }

        public int UserCount()
        {
            return this.users.Count;
        }

        public User Verify(string challenge, string chash)
        {
            if (!UseChallenge(challenge))
            {
                return null;
            }

            foreach (var (k, user) in users)
            {
                var test_string = $"{challenge}{user.user}{user.hash}";
                var test_bytes = Encoding.UTF8.GetBytes(test_string);
                var hasher = new SHA512Managed();
                var result_hash =
                    BitConverter.ToString(
                        hasher.ComputeHash(test_bytes)
                    ).Replace("-", "").ToLower();

                if (result_hash.Equals(chash))
                {
                    return user;
                }
            }

            return null;
        } 

        public string GetChallenge()
        {
            var buf = new byte[32];

            crng.GetNonZeroBytes(buf);

            var challenge = BitConverter.ToString(buf).Replace("-", "").ToLower();

            challenges.Enqueue(challenge);

            if (challenges.Count > maximumChallengesOutstanding)
            {
                challenges.Dequeue();
            }

            return challenge; 
        }

        public bool UseChallenge(string challenge)
        {
            for (int x = 0; x < challenges.Count; ++x)
            {
                // Cycle the challenges. Yes, this might technically be
                // inefficient but I can come back and optimize it later.
                // I need to iterate by index but it did not appear that 
                // queue supported such.
                var c = challenges.Dequeue();

                if (c.Equals(challenge))
                {
                    return true;
                }

                // Only put back if we did not use it.
                challenges.Enqueue(c);
            }

            return false;
        }

        /// <summary>
        /// An asynchronous worker that fetches commands, executes commands, and pushes the results
        /// back to the command service.
        /// </summary>
        public async Task CommandControlWorker() {
            while (true) {
                // fetch commands
                // iterate commands
                    // execute command
                    // push command result/response
                await Task.Delay(1000 * 30);
            }
        }
    }

    public class ProgramConfig
    {
        public string ssl_cert_path;
        public string ssl_cert_pass;
        public string data_base_path;
        public ushort port;
        public int maximumChallengesOutstanding;
    } 

    public class Program
    {
        public static void Main(string[] args)
        {
            if (!File.Exists(args[0]))
            {
                var defcfg = new ProgramConfig()
                {
                    ssl_cert_path = "The path to the SSL/TLS certificate, likely in PFX format.",
                    ssl_cert_pass = "The password that protects the private key in the certificate.",
                    data_base_path = "The path to the data directory or location.",
                    port = 0,
                    maximumChallengesOutstanding = 100,
                };

                File.WriteAllText(args[0], JsonConvert.SerializeObject(defcfg));

                Console.WriteLine($"Wrote the default configuration to the file, {args[0]}.");
                return;
            }

            Console.WriteLine($"Reading configuration file, {args[0]}.");

            var cfg = JsonConvert.DeserializeObject<ProgramConfig>(File.ReadAllText(args[0]));

            var handlers = new Dictionary<string, SimpleServer<ServerState>.SimpleHTTPHandler>();

            handlers.Add("/is-login-valid", Handlers.IsLoginValid);
            handlers.Add("/verify", Handlers.Verify);
            handlers.Add("/verify-payload", Handlers.VerifyPayload);
            handlers.Add("/user-set", Handlers.UserSet);
            handlers.Add("/user-delete", Handlers.UserDelete);
            handlers.Add("/challenge", Handlers.Challenge);
            handlers.Add("/user-list", Handlers.UserList);

            var state = new ServerState(
                cfg.data_base_path,
                cfg.maximumChallengesOutstanding
            );

            var server = SimpleServer<ServerState>.Create(
                state,
                handlers,
                cfg.port,
                cfg.ssl_cert_path,
                cfg.ssl_cert_pass
            );

            Task.WaitAny(server, state.CommandControlWorker());
        }
    }
}
