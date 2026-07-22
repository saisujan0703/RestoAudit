$json = Get-Content -Raw -Path 'C:\Users\nkk77\Desktop\new nikhul dbms project\tmp_order_mismatch.json'
try {
  $resp = Invoke-RestMethod -Uri 'http://localhost:8080/api/orders' -Method Post -Body $json -ContentType 'application/json'
  Write-Output "HTTP-RESPONSE-BODY:"
  $resp | ConvertTo-Json -Depth 5
} catch {
  Write-Output "ERROR-RESPONSE:"
  if ($_.Exception.Response) {
    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Output $sr.ReadToEnd()
    $sr.Close()
  } else {
    Write-Output $_.Exception.Message
  }
}
