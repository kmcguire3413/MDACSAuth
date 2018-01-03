'''
	This python script performs pre-commit functions.

	(1) Automatically update the version.
'''

'''
	$ cat MDACSAuth.csproj
	<Project Sdk="Microsoft.NET.Sdk">

	  <PropertyGroup>
		<OutputType>Exe</OutputType>
		<TargetFramework>netcoreapp2.0</TargetFramework>
		<AssemblyVersion>1.1.1.1</AssemblyVersion>
		<FileVersion>2.2.2.2</FileVersion>
	  </PropertyGroup>

	  <ItemGroup>
		<Reference Include="MDACSHTTPServer">
		  <HintPath>..\..\MDACSHTTPServer\bin\Debug\netstandard2.0\MDACSHTTPServer.dll</HintPath>
		</Reference>
	  </ItemGroup>

	</Project>
'''

import xml.etree.ElementTree as et
import datetime

def IncrementVersionString(verstr):
	verstr = verstr.split('.')

	major = int(verstr[0])
	minor = int(verstr[1])
	build = int(verstr[2])
	rev = int(verstr[3])

	dt = datetime.date.today()
	# The version is split into two 16-bit fields.
	# major.minor.YMM.DDRRR
	build = (dt.year - 2016) * 100 + dt.month
	rev_rrr = rev - (rev // 1000 * 1000)
	rev = dt.day * 1000 + (rev_rrr + 1)

	return '%s.%s.%s.%s' % (major, minor, build, rev)

def IncrementVersionOnProject(project, breaking_changes=False):
	path = './%s/%s.csproj' % (project, project)

	projxml = et.parse(path)

	root = projxml.getroot()

	filever = root.findall('./PropertyGroup/FileVersion')[0]
	filever.text = IncrementVersionString(filever.text)

	print(filever.text)

	if breaking_changes:
		asmver = root.findall('./PropertyGroup/AssemblyVersion')[0]
		asmver.text = IncrementVersionString(asmver.text)

	projxml.write(path)

IncrementVersionOnProject('MDACSAuth')