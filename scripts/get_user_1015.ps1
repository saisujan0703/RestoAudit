try {
  $u = Invoke-RestMethod -Uri 'http://localhost:8080/api/users/1015' -Method Get
  $u | ConvertTo-Json -Depth 5
} catch {
  if ($_.Exception.Response) {
    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Output $sr.ReadToEnd()
    $sr.Close()
  } else {
    Write-Output $_.Exception.Message
  }
}
