param(
    [Parameter(Mandatory = $true)]
    [string]$Email,

    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Password,

    [ValidateSet('user', 'operator', 'admin')]
    [string]$Role = 'user',

    [string]$ApiBaseUrl = 'http://localhost:3001/api/v1',

    [string]$AdminToken
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($Password.Length -lt 8) {
    throw 'A senha deve ter pelo menos 8 caracteres.'
}

if ($Role -ne 'user' -and [string]::IsNullOrWhiteSpace($AdminToken)) {
    throw 'Para criar usuario com role operator/admin, informe -AdminToken com JWT de admin.'
}

$body = @{
    email = $Email
    name = $Name
    password = $Password
}

if ($Role -eq 'user') {
    $url = "$ApiBaseUrl/auth/register"
    $headers = @{ 'Content-Type' = 'application/json' }
} else {
    $url = "$ApiBaseUrl/admin/users"
    $headers = @{
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $AdminToken"
    }
    $body.role = $Role
}

try {
    $response = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body ($body | ConvertTo-Json)

    if ($Role -eq 'user') {
        Write-Host 'Usuario cadastrado com sucesso via /auth/register.' -ForegroundColor Green
        Write-Host "ID: $($response.user.id)"
        Write-Host "Email: $($response.user.email)"
        Write-Host "Role: $($response.user.role)"
    } else {
        Write-Host 'Usuario interno cadastrado com sucesso via /admin/users.' -ForegroundColor Green
        Write-Host "ID: $($response.id)"
        Write-Host "Email: $($response.email)"
        Write-Host "Role: $($response.role)"
        Write-Host "Status: $($response.status)"
    }
} catch {
    Write-Host 'Falha ao cadastrar usuario.' -ForegroundColor Red
    if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream()) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $errorBody = $reader.ReadToEnd()
        Write-Host "Resposta da API: $errorBody"
    } else {
        Write-Host $_.Exception.Message
    }
    exit 1
}
