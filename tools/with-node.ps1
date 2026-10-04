param(
  [Parameter(Mandatory=$true)][string]$Command,
  [Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments
)
$ErrorActionPreference = 'Stop'
$taskRuntime = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
if (Test-Path -LiteralPath (Join-Path $taskRuntime 'node.exe')) {
  $env:PATH = $taskRuntime + [IO.Path]::PathSeparator + $env:PATH
}
$taskVersion = & node -p "process.versions.node"
if ([version]$taskVersion -lt [version]'20.19.4') { throw 'Node >=20.19.4 is required. Install a supported Node runtime before continuing.' }
if ($Command -in @('npm', 'npm.cmd', 'npx', 'npx.cmd')) {
  $taskNpm = (Get-Command npm.cmd -ErrorAction Stop).Source
  $taskCliName = if ($Command -like 'npx*') { 'npx-cli.js' } else { 'npm-cli.js' }
  $taskCli = Join-Path (Split-Path $taskNpm) ('node_modules\npm\bin\' + $taskCliName)
  & node $taskCli @Arguments
} else {
  & $Command @Arguments
}
exit $LASTEXITCODE
