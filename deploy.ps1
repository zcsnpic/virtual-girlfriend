$gitPath = "C:\Program Files\Git\bin\git.exe"

Write-Host "=== 检查Git状态 ==="
& $gitPath status

Write-Host "\n=== 添加所有更改 ==="
& $gitPath add .

Write-Host "\n=== 提交更改 ==="
& $gitPath commit -m "增强记忆功能和UI改进"

Write-Host "\n=== 推送到GitHub ==="
& $gitPath push origin main

Write-Host "\n=== 部署完成 ==="
