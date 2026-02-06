$path = "src\components\Navbar.tsx"
$lines = Get-Content $path
$newLines = @()
$skip = $false
$importAdded = $false

foreach ($line in $lines) {
    # Add Import (only once)
    if (-not $importAdded -and $line -match "import .* from 'react';") {
        $newLines += $line
        $newLines += "import MobileMenu from './MobileMenu';"
        $importAdded = $true
        continue
    }
    
    # Start of Mobile Menu Block
    if ($line -match "\{/\* Mobile Menu") {
        $skip = $true
        $newLines += "      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} logout={handleLogout} t={t} isSeller={isSeller} />"
        continue
    }
    
    # End of Mobile Menu Block (assuming </AnimatePresence> is the end)
    if ($skip -and $line -match "</AnimatePresence>") {
        $skip = $false
        continue
    }
    
    if (-not $skip) {
        $newLines += $line
    }
}

$newLines | Set-Content $path -Encoding UTF8
Write-Host "Navbar updated successfully"
