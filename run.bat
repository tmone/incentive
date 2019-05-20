@echo off
For /f "tokens=1,2,3,4,5 delims=/. " %%a in ('date/T') do set CDate=%%c%%b%%a%%d
echo Date: %CDate%
For /f "tokens=1,2,3 delims=: " %%a in ('time/T') do set CDate= %CDate%%%c%%a%%b
echo Date: %CDate%

FOR /F %%G IN (list.txt) DO "C:\Program Files\WinRAR\rar.exe" a -r %CDate%.rar %%G
echo.> list.txt