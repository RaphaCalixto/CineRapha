Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\NaoDr\Downloads\CineRapha"
WshShell.Run "cmd /c npm run app", 0, False
