$htmlPath = "C:\Users\Chandu\Chandu - Personal\cricket-underworld\prototype\index.html"
$lines = [System.IO.File]::ReadAllLines($htmlPath)
Write-Host "Read $($lines.Length) lines"