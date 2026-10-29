#!/usr/bin/env bash
set -euo pipefail
if ! command -v adb >/dev/null; then
  echo 'ADB não encontrado. Instale Android Platform Tools antes de continuar.' >&2
  exit 1
fi
if [[ -n "${1:-}" ]]; then
  device_serial="$1"
else
  mapfile -t device_serials < <(adb devices | awk 'NR>1 && $2=="device" { print $1 }')
  if [[ ${#device_serials[@]} -ne 1 ]]; then
    adb devices -l
    echo 'Conecte um único Android por USB, ative Depuração USB e autorize este computador na tela do celular.' >&2
    echo 'Se houver vários aparelhos: bash scripts/android-usb.sh SERIAL' >&2
    exit 1
  fi
  device_serial="${device_serials[0]}"
fi
adb -s "$device_serial" reverse tcp:5173 tcp:5173
adb -s "$device_serial" reverse --list
echo 'Encaminhamento USB preparado. Mantenha o cabo conectado.'
echo 'No Chrome do Android: http://localhost:5173/dev-tools/'
echo 'Laboratório: http://localhost:5173/sites/marie-curie/'
echo 'Para remover apenas este encaminhamento: adb -s SERIAL reverse --remove tcp:5173'
