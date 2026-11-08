#!/usr/bin/env python3
"""KIỂM RANH GIỚI ĐƠN VỊ: mọi vật độc lập; tương tác nảy ra khi hai vật độc lập gặp nhau.

Mã cảnh ghép thành MỘT phạm vi biến (build.py), nên tệp nào cũng "thấy" tên cấp tệp của mọi tệp khác. Bộ kiểm này giữ ranh giới:
  · ĐƠN VỊ = thư mục / tệp trong UNITS dưới đây, mỗi đơn vị một loại:
      agent  tác tử (kỹ sư, chó, thỏ, bò…)      thing  vật có trạng thái (xe, trại, đồ câu)
      env    môi trường dùng chung (core/, nature/, world/: địa hình, gió, nước, mưa, cây, đường, đập — ai cũng đọc được)
      lib    thư viện hàm thuần (animals/_lib/) — ai cũng gọi được
      shell  vỏ (loop/, ui/): vòng lặp + giao diện
  · ĐI XUYÊN MẶT cũng là chỗ dính: tác tử / vật thò vào trong vật của đơn vị khác qua mặt — X.object.userData, .getObjectByName, .traverse,
    .children, .add / .remove / .attach (mặt cho .object chỉ để làm khung toạ độ: localToWorld, vị trí, hướng). Muốn gì thì đơn vị chủ
    đưa lên mặt (số đo, chỗ chạm). Vỏ + hạ tầng vẫn duyệt được cả cảnh (vẽ, va chạm, chọn vật).
  · GHI QUA VẬT MẶT TRẢ RA cũng là chỗ dính (đợt 12): tác tử / vật cầm vật con của đơn vị khác lấy qua mặt (VAN.x, worldSee('x').y hoặc
    bí danh const c = CAMP.x) rồi GHI vào nó — gán thuộc tính, đổi khung (position / quaternion / scale… .copy / .set…, lookAt, rotateX…),
    đổi cây (add / attach / remove có đối số, clear, removeFromParent) hoặc nhận nó vào cây mình (tay.add(CAMP.x)). Muốn đổi thì đơn vị
    chủ mở CHỖ CHẠM (hàm trên mặt: CAMP.teaHand(tay, …), CAMP.grill.grab(tay, cỡ)…); đọc thì thoải mái. Mặt vẽ cố ý (SURFACES) không tính.
  · LUẬT: tên cấp tệp của agent / thing / shell chỉ dùng trong chính đơn vị đó. Đơn vị khác đọc MẶT CÔNG KHAI của nó qua
    worldSee('tên') (core/world.js) — mỗi bên chỉ cử động thân mình, tương tác = hai bên nhìn mặt nhau rồi tự quyết.
  · baseline.json: chỗ dính CŨ còn chờ tách (đơn vị dùng → đơn vị chủ → tên). Chỗ dính MỚI ⇒ lỗi (build.py --check dừng).
    Gỡ bớt chỗ cũ ⇒ chạy lại với --update để thu baseline lại.

  python3 src/tools/boundaries/check.py            kiểm (in bảng chỗ dính còn lại)
  python3 src/tools/boundaries/check.py --update   ghi lại baseline.json theo hiện trạng
  python3 src/tools/boundaries/check.py --list     in từng chỗ dính (tệp:dòng)
  python3 src/tools/boundaries/check.py --quiet    chỉ in dòng tổng + chỗ dính mới (build.py --check gọi)
"""
import json, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
APP = HERE.parent.parent / 'app'
BASE = HERE / 'baseline.json'

# tiền tố đường dẫn (trong src/app) → (tên đơn vị, loại) — tiền tố dài nhất thắng
UNITS = {
    'core/': ('hạ tầng', 'env'), 'nature/': ('thiên nhiên', 'env'), 'world/': ('công trình', 'env'),
    'loop/': ('vòng lặp', 'shell'), 'ui/': ('giao diện', 'shell'),
    'engineer/': ('kỹ sư', 'agent'),
    'van/': ('xe', 'thing'), 'camp/': ('trại', 'thing'), 'camp/carrot-bed.js': ('luống cà rốt', 'thing'), 'camp/biogas.js': ('biogas', 'thing'),
    'animals/_lib/': ('thư viện thú', 'lib'),
    'props/': ('xưởng dựng đồ vật', 'lib'),
    'animals/dog/': ('chó', 'agent'), 'animals/raccoon/': ('gấu mèo', 'agent'), 'animals/bunny/': ('thỏ', 'agent'),
    'animals/cows/': ('bò', 'agent'), 'animals/deer-crab/': ('hươu + cua', 'agent'), 'animals/fish/': ('cá', 'agent'),
    'animals/storks/': ('cò', 'agent'), 'animals/sparrows/': ('chim sẻ', 'agent'),
    'animals/chickens/': ('gà', 'agent'), 'animals/bees/': ('ong', 'agent'), 'animals/insects/': ('bướm + đom đóm', 'agent'),
}
KEYWORDS = set('''if for while switch catch function return typeof instanceof new delete void in of do else case break continue
default try finally throw class extends super this null true false undefined const let var await async yield import export with debugger'''.split())


def unit_of(rel):
    best = None
    for pre, u in UNITS.items():
        if rel.startswith(pre) and (best is None or len(pre) > len(best[0])): best = (pre, u)
    return best[1] if best else (rel.split('/')[0], 'agent')


def strip(src):   # bỏ chú thích + nội dung chuỗi (giữ biểu thức trong `${}`), giữ nguyên số dòng
    o, i, n = [], 0, len(src)
    while i < n:
        c, d = src[i], src[i + 1] if i + 1 < n else ''
        if c == '/' and d == '/':
            while i < n and src[i] != '\n': i += 1
            continue
        if c == '/' and d == '*':
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2
            o.append('\n' * src.count('\n', i, j)); i = j; continue
        if c in '"\'':
            q = c; i += 1
            while i < n and src[i] != q and src[i] != '\n':
                if src[i] == '\\': i += 1
                i += 1
            i += 1; o.append('""'); continue
        if c == '`':
            i += 1; depth = 0; o.append('`')
            while i < n:
                ch = src[i]
                if ch == '\\': i += 2; continue
                if ch == '$' and i + 1 < n and src[i + 1] == '{': depth += 1; o.append(' '); i += 2; continue
                if depth and ch == '}': depth -= 1; o.append(' '); i += 1; continue
                if not depth and ch == '`': break
                o.append(ch if depth or ch == '\n' else ''); i += 1
            i += 1; o.append('`'); continue
        o.append(c); i += 1
    return ''.join(o)


def split0(s):   # tách theo dấu phẩy ở độ sâu 0
    parts, depth, cur = [], 0, []
    for ch in s:
        if ch in '([{': depth += 1
        elif ch in ')]}': depth -= 1
        if ch == ',' and depth == 0: parts.append(''.join(cur)); cur = []
        else: cur.append(ch)
    parts.append(''.join(cur)); return parts


def lhs_names(part):   # tên được khai báo trong 1 phần "a = …" / "{a, b: c} = …" / "[a, b] = …" / tham số "a = 1"
    t = part.strip()
    if not t: return []
    if t[0] in '{[':
        depth, end = 0, len(t)
        for k, ch in enumerate(t):
            if ch in '([{': depth += 1
            elif ch in ')]}':
                depth -= 1
                if depth == 0: end = k; break
        inner, out = t[1:end], []
        for p in split0(inner):
            p = p.strip().lstrip('.').strip()
            if not p: continue
            if ':' in p.split('=')[0]: p = p.split(':', 1)[1]
            out += lhs_names(p) if p.strip()[:1] in '{[' else re.findall(r'^\s*([A-Za-z_$][\w$]*)', p)
        return out
    m = re.match(r'(?:\.\.\.)?\s*([A-Za-z_$][\w$]*)', t)
    return [m.group(1)] if m else []


def stmt_after(s, i):   # câu lệnh khai báo bắt đầu ở i, tới ';' / xuống dòng ở độ sâu 0
    depth, j = 0, i
    while j < len(s):
        ch = s[j]
        if ch in '([{': depth += 1
        elif ch in ')]}':
            depth -= 1
            if depth < 0: break
        elif depth == 0 and ch == ';': break
        elif depth == 0 and ch == '\n' and s[i:j].rstrip()[-1:] != ',': break   # dòng kết thúc bằng ',' ⇒ khai báo còn tiếp ở dòng sau
        j += 1
    return s[i:j]


def params(txt):
    out = []
    for p in split0(txt):
        out += lhs_names(p.split('=', 1)[0] if p.strip()[:1] not in '{[' else p)
    return out


def scan(rel, src):
    s = strip(src)
    top, local = set(), set()
    for m in re.finditer(r'(?m)^( *)(?:async\s+)?(function\*?|class|const|let|var)\s+', s):
        ind, kw, at = len(m.group(1)), m.group(2), m.end()
        names = re.findall(r'^([A-Za-z_$][\w$]*)', s[at:])[:1] if kw.startswith('function') or kw == 'class' else [n for p in split0(stmt_after(s, at)) for n in lhs_names(p.split('=', 1)[0] if p.strip()[:1] not in '{[' else p)]
        (top if ind == 8 else local).update(names)
    dep, d = [0] * (len(s) + 1), 0   # độ sâu ngoặc tại mỗi ký tự
    for k, ch in enumerate(s):
        dep[k] = d
        if ch in '([{': d += 1
        elif ch in ')]}': d -= 1
    for m in re.finditer(r'(?<![\w$.])(?:const|let|var)\s+', s):   # khai báo giữa dòng (for (const x …), sau ';' …) — ở độ sâu 0 thì vẫn là tên cấp tệp
        (top if dep[m.start()] == 0 else local).update(n for p in split0(stmt_after(s, m.end())) for n in lhs_names(p.split('=', 1)[0] if p.strip()[:1] not in '{[' else p))
    local -= top
    for m in re.finditer(r'(?<![\w$.])function\*?\s*([A-Za-z_$][\w$]*)?\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)', s): local.update(params(m.group(2)))
    for m in re.finditer(r'\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*=>', s): local.update(params(m.group(1)))
    for m in re.finditer(r'(?<![\w$.])([A-Za-z_$][\w$]*)\s*=>', s): local.add(m.group(1))
    for m in re.finditer(r'(?<![\w$.])catch\s*\(\s*([A-Za-z_$][\w$]*)', s): local.add(m.group(1))
    for m in re.finditer(r'(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(([^()]*)\)\s*\{', s):   # phương thức viết tắt: tick(S, dt) { … }
        if m.group(1) not in KEYWORDS: local.update(params(m.group(2)))
    for m in re.finditer(r'(?<![\w$.])(?:function\*?|class)\s+([A-Za-z_$][\w$]*)', s): local.add(m.group(1))
    local -= top
    uses = {}
    key = re.compile(r'(?<=[{,])\s*([A-Za-z_$][\w$]*)\s*:(?!:)')
    keys = {m.start(1) for m in key.finditer(s)}
    for m in re.finditer(r'(?<![\w$.\\])[A-Za-z_$][\w$]*', s):   # sau '\' là ký tự thoát trong biểu thức chính quy (\p{…}, \d…), không phải tên
        if m.start() in keys: continue
        uses.setdefault(m.group(0), []).append(s.count('\n', 0, m.start()) + 1)
    return top, local, uses


REACH = re.compile(r'(?<![\w$.])(?:([A-Z][A-Z_]*)|worldSee\(\s*""\s*\))\??\.object\??\.(userData|getObjectByName|getObjectById|getObjectByProperty|traverse|traverseVisible|children|add|remove|attach)\b')


def faces(order, raw):   # mặt 'x' → đơn vị chủ (worldFace) · tay cầm VAN → 'van' (worldLazy)
    owner, handle = {}, {}
    for r in order:
        s, lines = strip(raw[r]), raw[r].split('\n')
        for m in re.finditer(r'(?<![\w$.])worldFace\(', s):
            k = re.search(r"worldFace\(\s*'(\w+)'", lines[s.count('\n', 0, m.start())])
            if k: owner.setdefault(k.group(1), unit_of(r))
        for m in re.finditer(r'(?<![\w$.])([A-Z][A-Z_]*)\s*=\s*worldLazy\(', s):
            k = re.search(m.group(1) + r"\s*=\s*worldLazy\(\s*'(\w+)'", lines[s.count('\n', 0, m.start())])
            if k: handle[m.group(1)] = k.group(1)
    return owner, handle


def reach(order, raw, owner, handle):   # (đơn vị dùng, đơn vị chủ, 'VAN.object.userData') → [tệp:dòng] — chỉ tính tác tử / vật (vỏ + hạ tầng được duyệt cả cảnh: vẽ, va chạm, chọn)
    out = {}
    for r in order:
        u = unit_of(r)
        if u[1] not in ('agent', 'thing'): continue
        s, lines = strip(raw[r]), raw[r].split('\n')
        for m in REACH.finditer(s):
            ln = s.count('\n', 0, m.start())
            if m.group(1):
                face, who = handle.get(m.group(1)), m.group(1)
            else:
                k = re.search(r"worldSee\(\s*'(\w+)'\s*\)\??\.object", lines[ln]); face = k and k.group(1); who = "worldSee('%s')" % face
            ou = owner.get(face)
            if not ou or ou[0] == u[0]: continue
            out.setdefault((u[0], ou[0], '%s.object.%s' % (who, m.group(2))), []).append('%s:%d' % (r, ln + 1))
    return out


# ---------- GHI QUA VẬT MẶT TRẢ RA ----------
#  bí danh = khai báo const / let / var mà vế phải CHỈ là gốc + chuỗi thành viên (VAN.laptop, CAMP.fire.g — không có lời gọi); có hiệu lực
#  trong khối { } khai báo nó (cấp tệp ⇒ cả đơn vị), trừ chỗ tham số / khai báo trùng tên che. Không lần theo đối số hàm, phần tử
#  for…of, destructuring, gán lại biến sau khai báo — phần đó vẫn là việc của người viết.
SURFACES = {('van', 'laptop.ctx'): 'màn laptop: bút vẽ màn hình (canvas 2D) — xe đưa ra để người ngồi máy vẽ lên, vẽ xong gọi VAN.laptop.shown()'}   # mặt VẼ cố ý: ghi qua đây không tính
VECS = {'position', 'quaternion', 'rotation', 'scale', 'matrix', 'up', 'color', 'emissive'}
VEC_MUT = re.compile(r'(?:set\w*|copy|add\w*|sub\w*|multiply\w*|premultiply|divide\w*|apply\w*|lerp\w*|slerp\w*|normalize|invert|negate|reorder|identity|compose|clamp\w*|floor|ceil|round\w*|random\w*|cross\w*|project\w*|reflect|transform\w*|offsetHSL|convert\w*|rotate\w*|make\w*)$')
OBJ_MUT = {'lookAt', 'rotateX', 'rotateY', 'rotateZ', 'rotateOnAxis', 'rotateOnWorldAxis', 'translateX', 'translateY', 'translateZ', 'translateOnAxis',
           'applyMatrix4', 'applyQuaternion', 'setRotationFromAxisAngle', 'setRotationFromEuler', 'setRotationFromMatrix', 'setRotationFromQuaternion', 'clear', 'removeFromParent'}
ASSIGN = re.compile(r'\s*(?:\+\+|--|(?:\*\*|>>>|<<|>>|&&|\|\||\?\?|[-+*/%&|^])?=(?![=>]))')
IDENT = re.compile(r'(?<![\w$.\\])[A-Za-z_$][\w$]*')
DOT = re.compile(r'\s*\??\.\s*([A-Za-z_$][\w$]*)')
IDX = re.compile(r'[ \t]*(?:\?\.)?\[')
CALL = re.compile(r'[ \t]*(?:\?\.)?\(')
SEE = re.compile(r'\(\s*""\s*\)')


def nest(s):   # cặp ngoặc (mở → đóng) + ngoặc mở bao quanh gần nhất tại mỗi vị trí: mọi loại / ngoặc nhọn
    pair, st, cur, any_, curly = {}, [], [], [-1] * (len(s) + 1), [-1] * (len(s) + 1)
    for k, ch in enumerate(s):
        any_[k], curly[k] = st[-1] if st else -1, cur[-1] if cur else -1
        if ch in '([{':
            st.append(k)
            if ch == '{': cur.append(k)
        elif ch in ')]}' and st:
            o = st.pop(); pair[o] = k
            if cur and cur[-1] == o: cur.pop()
    return pair, any_, curly


def chain(s, i, pair):   # chuỗi thành viên sau gốc: .a ?.b [i] → (các bậc, vị trí ngay sau chuỗi)
    out = []
    while True:
        m = DOT.match(s, i)
        if m: out.append(m.group(1)); i = m.end(); continue
        m = IDX.match(s, i)
        if m: out.append('[]'); i = pair.get(m.end() - 1, m.end() - 1) + 1; continue
        return out, i


def shadows(s, pair, any_, curly):   # tên → các khoảng bị che: thân hàm có tham số trùng tên · từ khai báo trùng tên tới hết khối
    sh = {}
    def body(k):   # thân hàm bắt đầu ở k ('{' ⇒ cả khối; biểu thức ⇒ tới hết ngoặc bao quanh)
        while k < len(s) and s[k] in ' \t\n': k += 1
        if k < len(s) and s[k] == '{': return k, pair.get(k, len(s))
        o = any_[k] if k < len(s) else -1
        return k, pair.get(o, len(s)) if o >= 0 else len(s)
    def add(names, span):
        for n in names: sh.setdefault(n, []).append(span)
    for m in re.finditer(r'(?<![\w$.])function\*?\s*(?:[A-Za-z_$][\w$]*)?\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)', s): add(params(m.group(1)), body(m.end()))
    for m in re.finditer(r'\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*=>', s): add(params(m.group(1)), body(m.end()))
    for m in re.finditer(r'(?<![\w$.])([A-Za-z_$][\w$]*)\s*=>', s): add([m.group(1)], body(m.end()))
    for m in re.finditer(r'(?<![\w$.])catch\s*\(\s*([A-Za-z_$][\w$]*)\s*\)', s): add([m.group(1)], body(m.end()))
    for m in re.finditer(r'(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(([^()]*)\)\s*\{', s):   # phương thức viết tắt: tick(S, dt) { … }
        if m.group(1) not in KEYWORDS: add(params(m.group(2)), body(m.end() - 1))
    decl = []   # (vị trí, tên, vế phải) mọi khai báo — vế phải để nhận bí danh
    for m in re.finditer(r'(?<![\w$.])(?:const|let|var)\s+', s):
        c = curly[m.start()]; end = pair.get(c, len(s)) if c >= 0 else len(s)
        for d in split0(stmt_after(s, m.end())):
            lhs, _, rhs = d.partition('=')
            for n in (lhs_names(lhs) if lhs.strip()[:1] not in '{[' else lhs_names(d)):
                sh.setdefault(n, []).append((m.start(), end)); decl.append((m.start(), n, rhs if lhs.strip()[:1] not in '{[' and not rhs.startswith('=') else None, end))
    return sh, decl


def writes(order, raw, owner, handle):   # (đơn vị dùng, đơn vị chủ, 'ghi CAMP.teaCup.visible =') → [tệp:dòng] — chỉ tác tử / vật
    files = {}
    for r in order:
        u = unit_of(r)
        if u[1] not in ('agent', 'thing'): continue
        s = strip(raw[r]); pair, any_, curly = nest(s); sh, decl = shadows(s, pair, any_, curly)
        files[r] = (u, s, raw[r].split('\n'), pair, sh, decl, curly)
    def see_face(r, s, lines, p):   # worldSee("") ở p (chuỗi đã xoá) → tên mặt đọc từ dòng gốc, theo thứ tự xuất hiện trên dòng
        a = s.rfind('\n', 0, p) + 1; k = len(re.findall(r'(?<![\w$.])worldSee\(', s[a:p]))
        names = re.findall(r"(?<![\w$.])worldSee\(\s*'(\w+)'", lines[s.count('\n', 0, p)])
        return names[k] if k < len(names) else None
    def root_at(r, p, name, alias, unitw):   # gốc ở p: (mặt, đường dẫn, tên hiện, vị trí sau gốc) | None
        u, s, lines, pair, sh, decl, curly = files[r]
        cover = lambda a: any(a < x <= p < y for x, y in sh.get(name, []))
        if name == 'worldSee':
            m = SEE.match(s, p + len(name))
            f = m and see_face(r, s, lines, p)
            return (f, [], "worldSee('%s')" % f, m.end()) if f and owner.get(f) and owner[f][0] != u[0] else None
        if name in handle and owner.get(handle[name]) and owner[handle[name]][0] != u[0] and not cover(-1): return (handle[name], [], name, p + len(name))
        for (a, b, f, path, disp) in reversed(alias.get(name, [])):
            if a <= p < b and not cover(a): return (f, path, disp, p + len(name))
        if name in unitw.get(u[0], {}) and not cover(-1): f, path, disp = unitw[u[0]][name]; return (f, path, disp, p + len(name))
        return None
    def resolve(r, a, rhs, alias, unitw):   # vế phải = gốc + chuỗi thành viên (không lời gọi) ⇒ (mặt, đường dẫn, tên hiện)
        u, s, lines, pair, sh, decl, curly = files[r]
        m = re.match(r'\s*', rhs); p0 = s.find(rhs, a) + m.end()
        im = IDENT.match(s, p0)
        if not im: return None
        g = root_at(r, p0, im.group(0), alias, unitw)
        if not g: return None
        mem, j = chain(s, g[3], pair)
        if s[j:p0 + len(rhs.rstrip()) - m.end()].strip(): return None
        return g[0], g[1] + mem, g[2]
    unitw, aliases = {}, {r: {} for r in files}   # bí danh cấp tệp (cả đơn vị) · bí danh theo khối
    for _ in range(3):   # bí danh nối bí danh (const LP = VAN.laptop; const x = LP.ctx)
        for r, (u, s, lines, pair, sh, decl, curly) in files.items():
            for (a, n, rhs, end) in decl:
                if rhs is None: continue
                g = resolve(r, a, rhs, aliases[r], unitw)
                if not g: continue
                if curly[a] < 0: unitw.setdefault(u[0], {})[n] = g
                elif not any(x[0] == a for x in aliases[r].get(n, [])): aliases[r].setdefault(n, []).append((a, end) + g)
                sh[n] = [x for x in sh.get(n, []) if x[0] != a]   # khai báo bí danh không tự che mình
    out = {}
    def hit(r, p, f, path, disp, what):
        u, s = files[r][0], files[r][1]
        if any(f == sf and ('.'.join(path) + '.').startswith(sp + '.') for sf, sp in SURFACES): return
        out.setdefault((u[0], owner[f][0], what % (disp + ''.join('[]' if x == '[]' else '.' + x for x in path))), []).append('%s:%d' % (r, s.count('\n', 0, p) + 1))
    for r, (u, s, lines, pair, sh, decl, curly) in files.items():
        for m in IDENT.finditer(s):
            g = root_at(r, m.start(), m.group(0), aliases[r], unitw)
            if not g: continue
            f, base, disp, j = g
            mem, k = chain(s, j, pair); path = base + mem
            if mem and ASSIGN.match(s, k): hit(r, m.start(), f, path, disp, 'ghi %s ='); continue
            c = CALL.match(s, k)
            if not c or not mem or mem[-1] == '[]': continue
            meth, recv, args = mem[-1], path[:-1], s[c.end():pair.get(c.end() - 1, c.end())].strip()
            if (meth in ('add', 'attach', 'remove') and args) or meth in OBJ_MUT or (recv and recv[-1] in VECS and VEC_MUT.match(meth)):
                hit(r, m.start(), f, path, disp, 'ghi %s()')
        for m in re.finditer(r'\.(?:add|attach)\(\s*', s):   # nhận vật con của đơn vị khác vào cây mình
            im = IDENT.match(s, m.end())
            g = im and root_at(r, m.end(), im.group(0), aliases[r], unitw)
            if not g: continue
            mem, k = chain(s, g[3], pair)
            if re.match(r'\s*[,)]', s[k:]) and (g[1] + mem): hit(r, m.end(), g[0], g[1] + mem, g[2], 'nhận %s vào cây mình')
    return out


def collect():
    order = []
    for line in (APP / 'manifest.txt').read_text(encoding='utf-8').splitlines():
        r = line.split('#', 1)[0].strip()
        if r: order.append(r)
    info = {r: scan(r, (APP / r).read_text(encoding='utf-8')) for r in order}
    owner = {}
    for r in order:
        for n in info[r][0]: owner.setdefault(n, r)
    viol = {}   # (đơn vị dùng, đơn vị chủ, tên) → [tệp:dòng]
    for r in order:
        top, local, uses = info[r]
        u = unit_of(r)
        for n, lines in uses.items():
            o = owner.get(n)
            if not o or n in top or n in local or n in KEYWORDS: continue
            ou = unit_of(o)
            if ou[0] == u[0] or ou[1] in ('env', 'lib'): continue
            viol.setdefault((u[0], ou[0], n), []).extend('%s:%d' % (r, l) for l in lines)
    raw = {r: (APP / r).read_text(encoding='utf-8') for r in order}
    owner, handle = faces(order, raw)
    for k, v in reach(order, raw, owner, handle).items(): viol.setdefault(k, []).extend(v)
    for k, v in writes(order, raw, owner, handle).items(): viol.setdefault(k, []).extend(v)
    return viol


def main():
    args = set(sys.argv[1:])
    viol = collect()
    cur = sorted('%s → %s: %s' % k for k in viol)
    if '--update' in args:
        BASE.write_text(json.dumps(cur, ensure_ascii=False, indent=0) + '\n', encoding='utf-8')
        print('ghi baseline.json: %d chỗ dính' % len(cur)); return 0
    base = set(json.loads(BASE.read_text(encoding='utf-8'))) if BASE.exists() else set()
    pairs = {}
    for (a, b, n) in viol: pairs.setdefault((a, b), []).append(n)
    if '--list' in args:
        for k in sorted(viol): print('%s → %s: %s  %s' % (k[0], k[1], k[2], ' '.join(viol[k][:6]) + (' …' if len(viol[k]) > 6 else '')))
    elif '--quiet' not in args:
        for (a, b), ns in sorted(pairs.items(), key=lambda kv: -len(kv[1])): print('  %-32s %3d  %s' % (a + ' → ' + b, len(ns), ' '.join(sorted(ns)[:12]) + (' …' if len(ns) > 12 else '')))
    new = [c for c in cur if c not in base]
    gone = [c for c in base if c not in set(cur)]
    print('Ranh giới: %d chỗ dính giữa đơn vị (%d cặp) · baseline %d · mới %d · đã gỡ %d' % (len(cur), len(pairs), len(base), len(new), len(gone)))
    if gone: print('  đã gỡ (chạy --update để thu baseline):', '; '.join(gone[:8]) + (' …' if len(gone) > 8 else ''))
    if new:
        print('LỖI — chỗ dính MỚI giữa đơn vị (đọc mặt công khai qua worldSee thay vì tên riêng của đơn vị khác; muốn đổi đồ của đơn vị khác thì gọi chỗ chạm trên mặt nó):')
        for c in new:
            a, rest = c.split(' → '); b, n = rest.split(': ')
            print('  ', c, ' '.join(viol[(a, b, n)][:4]))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
