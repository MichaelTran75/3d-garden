#!/usr/bin/env python3
"""Mục lục cho tài liệu kiến trúc: AI đọc mục lục (có cỡ từng mục) rồi chỉ mở mục cần.

  python3 src/tools/docs/doc_index.py           làm mới mục lục đầu mỗi docs/architecture/*.md (giữa <!-- toc --> … <!-- /toc -->), in cỡ từng tệp
  python3 src/tools/docs/doc_index.py --check   không ghi gì; chỉ báo (build.py --check gọi, không chặn dựng)

Quy ước:
  · src/ARCHITECTURE.md là CHỈ MỤC: ≤ IDX_LINES dòng, ≤ IDX_KB KB — chi tiết để trong docs/architecture/<khu>.md;
  · mỗi tệp khu ≤ AREA_KB KB, chỉ ghi hiện trạng + bẫy (lịch sử ở git); sửa mã xong thì cập nhật đúng mục;
  · mọi tệp khu phải có tên trong chỉ mục (không thì AI không biết mà mở).
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[3]          # 3d-garden/
IDX = ROOT / 'src' / 'ARCHITECTURE.md'
AREA = ROOT / 'docs' / 'architecture'
IDX_LINES, IDX_KB, AREA_KB = 300, 30, 40
T0, T1 = '<!-- toc -->', '<!-- /toc -->'


def slug(text, seen):
    """Neo kiểu GitHub: chữ thường, bỏ dấu câu (giữ chữ có dấu, số, '-', '_'), dấu cách → '-', trùng thì thêm -1, -2…"""
    s = re.sub(r'[^\w\- ]', '', text.strip().lower()).replace(' ', '-')
    n = seen.get(s, 0)
    seen[s] = n + 1
    return s if n == 0 else '%s-%d' % (s, n)


def sections(text):
    """[(tiêu đề, neo, số byte của mục)] cho mọi tiêu đề '## ' ngoài khối mã ``` — neo tính trên cả tệp (cả '# ' đầu tệp) như GitHub."""
    seen, out, fence, cur = {}, [], False, None
    for line in text.split('\n'):
        if line.lstrip().startswith('```'):
            fence = not fence
        m = None if fence else re.match(r'(#{1,6}) (.+)$', line)
        if m:
            a = slug(m.group(2), seen)
            if len(m.group(1)) == 2:
                cur = [m.group(2).strip(), a, 0]
                out.append(cur)
                continue
            if len(m.group(1)) == 1:
                cur = None
        if cur is not None:
            cur[2] += len(line.encode('utf-8')) + 1   # byte, cùng đơn vị với cỡ tệp
    return out


def toc_block(text):
    body = text
    if T0 in text and T1 in text:
        body = text[:text.index(T0)] + text[text.index(T1) + len(T1):]
    rows = ['- %s · %.1f KB' % (h, n / 1000) for h, a, n in sections(body)]   # không link neo: neo tiếng Việt dài gấp đôi tiêu đề, người đọc tìm mục bằng grep '^## '
    return T0 + '\n' + '\n'.join(rows) + '\n' + T1, [r.rsplit(' · ', 1)[0] for r in rows]


def main():
    check = '--check' in sys.argv
    notes, sizes = [], []
    if IDX.exists():
        t = IDX.read_text(encoding='utf-8')
        n, kb = t.count('\n') + 1, len(t.encode('utf-8')) / 1024
        if n > IDX_LINES or kb > IDX_KB:
            notes.append('src/ARCHITECTURE.md %d dòng / %.0f KB > %d / %d — chỉ mục phải ngắn: dời chi tiết sang docs/architecture/<khu>.md' % (n, kb, IDX_LINES, IDX_KB))
    else:
        t = ''
    if not AREA.is_dir():                                    # bản chép để gỡ lỗi (mk.sh bỏ docs/): không có gì để kiểm
        print('Tài liệu: không có docs/architecture — bỏ qua')
        return
    for p in sorted(AREA.glob('*.md')):
        text = p.read_text(encoding='utf-8')
        kb = len(text.encode('utf-8')) / 1024
        sizes.append('%s %.0f' % (p.stem, kb))
        if kb > AREA_KB:
            notes.append('%s %.0f KB > %d KB — tách thành 2 khu' % (p.name, kb, AREA_KB))
        if p.name not in t:
            notes.append('%s chưa có trong chỉ mục src/ARCHITECTURE.md' % p.name)
        if T0 not in text or T1 not in text:
            notes.append('%s thiếu cặp %s … %s' % (p.name, T0, T1))
            continue
        block, keys = toc_block(text)
        old = text[text.index(T0):text.index(T1) + len(T1)]
        if check:
            if [r.rsplit(' · ', 1)[0] for r in old.split('\n')[1:-1]] != keys:
                notes.append('%s: mục lục cũ — chạy python3 src/tools/docs/doc_index.py' % p.name)
        elif old != block:
            p.write_text(text.replace(old, block), encoding='utf-8')
    print('Tài liệu: chỉ mục %d dòng · %d tệp khu (KB: %s)' % (t.count('\n') + 1, len(sizes), ', '.join(sizes)))
    for s in notes:
        print('  ⚠ ' + s)


if __name__ == '__main__':
    main()
