import os

fixes = {
    'src/app/api/contacts/route.ts': '../../../lib/db',
    'src/app/api/dashboard/route.ts': '../../../lib/db',
    'src/app/api/export/route.ts': '../../../lib/db',
    'src/app/api/waves/route.ts': '../../../lib/db',
    'src/app/api/panitia/route.ts': '../../../lib/db',
    'src/app/api/contacts/auto-balance/route.ts': '../../../../lib/db',
    'src/app/api/waves/[id]/route.ts': '../../../../lib/db',
    'src/app/api/contacts/[id]/status/route.ts': '../../../../../lib/db',
    'src/app/api/contacts/[id]/assign/route.ts': '../../../../../lib/db',
    'src/app/api/panitia/[id]/contacts/route.ts': '../../../../../lib/db',
}

for path, target in fixes.items():
    if os.path.exists(path):
        lines = open(path, 'r', encoding='utf-8').readlines()
        new_lines = []
        for line in lines:
            if 'lib/db' in line:
                new_lines.append(f"import {{ query }} from '{target}';\n")
            else:
                new_lines.append(line)
        open(path, 'w', encoding='utf-8').writelines(new_lines)
        print('Updated:', path, '->', target)
