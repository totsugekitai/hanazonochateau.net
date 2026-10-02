#!/usr/bin/env bash

set -euo pipefail

DATA_DIR='./data/575'
INDEX_MD='./content/575/_index.md'
FIRST_LINE=10

# TOML の basic string 用にエスケープする
toml_escape() {
    local s=$1
    s=${s//\\/\\\\}
    s=${s//\"/\\\"}
    s=${s//$'\t'/\\t}
    s=${s//$'\r'/\\r}
    s=${s//$'\n'/\\n}
    printf '%s' "$s"
}

write_toml() {
    local hash=$1 content=$2
    local yomibito date body filename

    if [[ $hash =~ ^0+$ ]]; then
        echo "warning: skipping uncommitted line: ${content}" >&2
        return
    fi

    yomibito=$(git --no-pager log -1 --format=%an "$hash")
    date=$(git --no-pager log -1 --format=%aI "$hash")
    body=$(git --no-pager log -1 --format=%b "$hash")

    filename=$(printf '%s\n' "$content" | sha256sum | awk '{print $1}')
    if [[ -e "${DATA_DIR}/${filename}.toml" ]]; then
        echo "warning: duplicate content, overwriting: ${content}" >&2
    fi

    cat << EOS > "${DATA_DIR}/${filename}.toml"
commit_hash = "${hash}"
yomibito = "$(toml_escape "$yomibito")"
date = ${date}
content = "$(toml_escape "$content")"
commit_text_body = "$(toml_escape "$body")"
EOS
}

mkdir -p "$DATA_DIR"
# 前回生成したデータを消す
rm -f "$DATA_DIR"/*.toml

blame=$(git --no-pager blame -L "${FIRST_LINE}," --line-porcelain "$INDEX_MD")

hash=''
while IFS= read -r line; do
    if [[ $line =~ ^([0-9a-f]{40})\  ]]; then
        hash=${BASH_REMATCH[1]}
    elif [[ $line == $'\t'* ]]; then
        content=${line#$'\t'}
        content=${content#"${content%%[! ]*}"}
        if [[ $content != '- '* ]]; then
            continue
        fi
        write_toml "$hash" "${content#- }"
    fi
done <<< "$blame"
