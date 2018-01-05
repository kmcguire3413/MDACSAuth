SET PATH=%PATH%;"C:\PROGRAM FILES\nodejs";"%APPDATA%\npm\node_modules\npm-run\bin\";"%APPDATA%\npm\";"%LOCALAPPDATA%\Programs\Python\Python36\python.exe"
python.exe pre-build.py
babel --plugins transform-react-jsx .\webres\app.jsx > .\webres\app.js