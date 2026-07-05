from pathlib import Path

files = list(Path('src').rglob('*.js')) + list(Path('src').rglob('*.jsx'))
print(f'Processing {len(files)} files')

for path in files:
    text = path.read_text(encoding='utf-8')
    out = []
    i = 0
    n = len(text)
    state = 'normal'
    quote = ''
    while i < n:
        c = text[i]
        nxt = text[i + 1] if i + 1 < n else ''
        if state == 'normal':
            if c == '/' and nxt == '/':
                i += 2
                while i < n and text[i] != '\n':
                    i += 1
                continue
            if c == '/' and nxt == '*':
                i += 2
                while i + 1 < n and not (text[i] == '*' and text[i + 1] == '/'):
                    i += 1
                i += 2
                continue
            if c in '"\'' and quote == '':
                quote = c
                state = 'string'
                out.append(c)
                i += 1
                continue
            if c == '`':
                quote = c
                state = 'template'
                out.append(c)
                i += 1
                continue
            out.append(c)
            i += 1
        elif state == 'string':
            out.append(c)
            if c == '\\':
                if i + 1 < n:
                    out.append(text[i + 1])
                    i += 2
                    continue
            if c == quote:
                state = 'normal'
                quote = ''
            i += 1
        else:
            out.append(c)
            if c == '\\':
                if i + 1 < n:
                    out.append(text[i + 1])
                    i += 2
                    continue
            if c == '`':
                state = 'normal'
                quote = ''
            elif c == '$' and nxt == '{':
                out.append(nxt)
                i += 2
                continue
            i += 1
    new_text = ''.join(out)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        print(f'Cleaned {path}')
