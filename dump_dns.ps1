$srv = Resolve-DnsName -Type SRV _mongodb._tcp.expressecommerce.amkghw1.mongodb.net | ConvertTo-Json
$txt = Resolve-DnsName -Type TXT expressecommerce.amkghw1.mongodb.net | ConvertTo-Json
$output = "SRV:`n$srv`nTXT:`n$txt"
Set-Content -Path "C:\Users\Dell\Desktop\ipoReminder\dns_output.txt" -Value $output
