$h = @{ 'X-Branch-Id' = '101' }
try {
  Invoke-RestMethod -Uri 'http://localhost:8080/api/orders/5024' -Method Delete -Headers $h -ErrorAction Stop
  Write-Output 'Deleted'
} catch {
  if ($_.Exception.Response) {
    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Output $sr.ReadToEnd()
    $sr.Close()
  } else {
    Write-Output $_.Exception.Message
  }
}
