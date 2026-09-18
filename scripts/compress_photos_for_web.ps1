<#
.SYNOPSIS
Komprimiert alle Fotos (.jpg, .png) in einem Ordner für das Web (max 1920px Breite).
#>
param (
    [string]$TargetFolder = "..\assets\images"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $TargetFolder)) {
    Write-Host "Ordner nicht gefunden: $TargetFolder" -ForegroundColor Red
    exit
}

$files = Get-ChildItem -Path $TargetFolder -Include *.jpg, *.jpeg, *.png -Recurse

foreach ($file in $files) {
    # Skip already optimized files to avoid double compression
    if ($file.Name -match "_web\.") { continue }

    Write-Host "Optimiere: $($file.Name)..."
    
    $img = [System.Drawing.Image]::FromFile($file.FullName)
    
    $newWidth = $img.Width
    $newHeight = $img.Height
    
    if ($img.Width -gt 1920) {
        $newWidth = 1920
        $newHeight = [math]::Round($img.Height * (1920 / $img.Width))
    }
    
    $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($newImg)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
    
    $newName = $file.Name.Insert($file.Name.LastIndexOf('.'), "_web")
    $outPath = Join-Path $file.DirectoryName $newName
    
    # Save as high-quality JPEG
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]80)
    
    # Must dispose original before we could potentially overwrite, but we are saving as _web anyway
    $newImg.Save($outPath, $codec, $encoderParams)
    
    $graphics.Dispose()
    $newImg.Dispose()
    $img.Dispose()
    
    Write-Host "Gespeichert als: $newName" -ForegroundColor Green
}
Write-Host "Alle Bilder optimiert!" -ForegroundColor Cyan
