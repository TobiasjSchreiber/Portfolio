<#
.SYNOPSIS
Komprimiert ein Video auf knapp unter 100 MB (ca. 94 MB) für GitHub.
.DESCRIPTION
Nutzt FFmpeg mit 2-Pass-Encoding. Rechnet 4K-Videos automatisch auf 1080p herunter.
#>
param (
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

if (-not (Test-Path $FilePath)) {
    Write-Host "Datei nicht gefunden: $FilePath" -ForegroundColor Red
    exit
}

$targetMB = 94
$audioBitrateKbps = 128

$durationStr = (ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "`"$FilePath`"")
$duration = [double]$durationStr

if ($duration -eq 0) {
    Write-Host "Konnte Videolänge nicht ermitteln." -ForegroundColor Red
    exit
}

$totalBitrateKbps = [math]::Floor(($targetMB * 8192) / $duration)
$videoBitrateKbps = $totalBitrateKbps - $audioBitrateKbps

if ($videoBitrateKbps -lt 100) { $videoBitrateKbps = 500 }

$dir = Split-Path $FilePath -Parent
$name = Split-Path $FilePath -Leaf
$outPath = Join-Path $dir "compressed_$name"

Write-Host "Starte Komprimierung von $name (Ziel-Bitrate: ${videoBitrateKbps}k)..." -ForegroundColor Cyan

$args1 = @("-y", "-i", $FilePath, "-vf", "scale='min(1920,iw)':-2", "-c:v", "libx264", "-b:v", "${videoBitrateKbps}k", "-pass", "1", "-an", "-f", "mp4", "NUL")
Start-Process -FilePath "ffmpeg" -ArgumentList $args1 -Wait -NoNewWindow

$args2 = @("-y", "-i", $FilePath, "-vf", "scale='min(1920,iw)':-2", "-c:v", "libx264", "-b:v", "${videoBitrateKbps}k", "-pass", "2", "-c:a", "aac", "-b:a", "${audioBitrateKbps}k", $outPath)
Start-Process -FilePath "ffmpeg" -ArgumentList $args2 -Wait -NoNewWindow

if (Test-Path $outPath) {
    Write-Host "Erfolgreich! Die komprimierte Datei liegt hier: $outPath" -ForegroundColor Green
    Remove-Item "ffmpeg2pass-0.log*" -ErrorAction SilentlyContinue
}
