import sys, os, re
html = open(sys.argv[1], encoding='utf-8').read().split('\n'); root = sys.argv[2]
files = {}
for r, ds, fs in os.walk(root):
    for f in fs:
        if f.endswith('.js'): p = os.path.join(r, f); files[os.path.relpath(p, root)] = open(p, encoding='utf-8').read()
for ln in sys.argv[3:]:
    L = html[int(ln) - 1].strip(); hit = None
    for k in range(min(len(L), 60), 15, -5):
        for a in range(0, max(1, len(L) - k), 7):
            sub = L[a:a + k]
            fs = [f for f, t in files.items() if sub in t]
            if len(fs) == 1: hit = fs[0]; break
        if hit: break
    print(ln, hit, '|', L[:90])
