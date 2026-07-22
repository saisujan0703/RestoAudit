$lines = netstat -aon | Select-String ':8080' -ErrorAction SilentlyContinue
if ($lines) {
  foreach ($l in $lines) {
    $parts = ($l -replace '^\s+','') -split '\s+'
    $pid = $parts[-1]
    Write-Output "Killing PID $pid"
    try { Stop-Process -Id $pid -Force -ErrorAction Stop } catch { Write-Output ("Failed to kill {0}: {1}" -f $pid, $_) }
  }
} else { Write-Output 'No process listening on 8080' }
