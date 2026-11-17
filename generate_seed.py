import zipfile
import xml.etree.ElementTree as ET
import re

panitia_groups = [
    {
        "group": "Group 1",
        "members": [
            "Novan Setyadi Tindaon",
            "Vena Melinda Barimbing",
            "Elfride Hanum Simanjuntak"
        ]
    },
    {
        "group": "Group 2",
        "members": [
            "Novianti Tampubolon",
            "Nirawati Rajagukguk",
            "Erika Arta Mevia Sitorus",
            "Setia Dame Silaban",
            "Yunita Anastasia Mega Sinaga"
        ]
    },
    {
        "group": "Group 3",
        "members": [
            "Friska Uliaty Tampubolon",
            "Sartina Purba",
            "Karel Immanuel Ginting",
            "Evi Siburian",
            "Florence Siregar"
        ]
    },
    {
        "group": "Group 4",
        "members": [
            "Fanotona Giawa",
            "Joi Jogi Pratama Pakpahan",
            "Palma Widia Sinaga",
            "Tesyalonika Sitorus"
        ]
    },
    {
        "group": "Group 5",
        "members": [
            "Charlie Nainggolan",
            "Tio Grecya Martha Simamora",
            "Elvi Christalina Situmorang",
            "Della Edelweiss Manalu"
        ]
    },
    {
        "group": "Group 6",
        "members": [
            "Ririn Silaban",
            "Masnur Rajagukguk",
            "Santri Julianta Pakpahan"
        ]
    },
    {
        "group": "Group 7",
        "members": [
            "Eltisha Manihuruk",
            "Indah Suryani Ompusunggu",
            "Mai Debora Gultom"
        ]
    }
]

all_panitia = []
for grp in panitia_groups:
    for m in grp["members"]:
        all_panitia.append({"name": m.strip(), "group": grp["group"]})

print(f"Total Panitia: {len(all_panitia)}")

# Waves
waves = [
    {
        "wave_number": 1,
        "title": "Blast 1 - Undangan Resmi & Save The Date",
        "scheduled_date": "22 November 2026",
        "template": """Shalom Kak/Bang {nama},

Salam sejahtera dalam kasih Tuhan Yesus Kristus.

Keluarga Besar Yayasan Perkumpulan Alumni Kristen Sumatera Utara (PAKSU) mengundang Kak/Bang {nama} untuk hadir bersama dalam:

🎄 *IBADAH NATAL KELUARGA BESAR YAYASAN PAKSU* 🎄
✨ *Tema:* "CHRIST'S AMBASSADOR" (1 Petrus 2:9)
🎙️ *Pembicara:* Pdt. Alex Nanlohy
📅 *Hari/Tanggal:* Sabtu, 12 Desember 2026
⏰ *Waktu:* 17.00 WIB s/d selesai
📍 *Tempat:* Gedung Seminar AB UKI Jakarta Timur

Kehadiran Kak/Bang {nama} dan keluarga akan menjadi sukacita dan berkat besar bagi kita bersama.

Mohon konfirmasi kehadiran Kak/Bang dengan membalas pesan ini ya:
1️⃣ Hadir
2️⃣ Belum bisa hadir

Terima kasih. Tuhan Yesus Memberkati! 🌟

Salam hangat,
*{panitia}*
Panitia Natal PAKSU 2026
Info: paksu.info"""
    },
    {
        "wave_number": 2,
        "title": "Blast 2 - Reminder & Follow-Up Konfirmasi",
        "scheduled_date": "29 November 2026",
        "template": """Shalom Kak/Bang {nama},

Semoga Kak/Bang senantiasa sehat dan diberkati Tuhan.

Mengingatkan kembali undangan Ibadah Natal Keluarga Besar PAKSU yang akan diadakan pada:
📅 *Sabtu, 12 Desember 2026 (Pukul 17.00 WIB)*
📍 *Gedung Seminar AB UKI Jakarta Timur*
🎙️ *Pdt. Alex Nanlohy* ("CHRIST'S AMBASSADOR")

Untuk keperluan pendataan tempat dan konsumsi, apakah Kak/Bang {nama} sudah bisa memastikan kehadirannya?

Bisa mohon info balasan kehadirannya ya Kak/Bang. Terima kasih banyak atas perhatian dan waktunya! 🙏✨

Salam kasih,
*{panitia}*
Panitia Natal PAKSU 2026"""
    },
    {
        "wave_number": 3,
        "title": "Blast 3 - Final Countdown & H-6 Acara",
        "scheduled_date": "6 Desember 2026",
        "template": """Shalom Kak/Bang {nama},

H-6 Menuju Ibadah Natal Keluarga Besar Yayasan PAKSU! 🎄✨

Kami sangat menantikan kehadiran Kak/Bang {nama} pada:
📅 *Sabtu, 12 Desember 2026*
⏰ *Pukul 17.00 WIB* (Open Gate 16.30 WIB)
📍 *Gedung Seminar AB UKI Jakarta Timur*
Maps: https://maps.google.com/?q=Gedung+Seminar+AB+UKI+Jakarta+Timur

Mari kita bersama memuji, bersyukur, dan merayakan kelahiran Sang Juru Selamat dalam persekutuan kasih.

Sampai jumpa di hari Sabtu nanti ya Kak/Bang! Tuhan Yesus memberkati selalu. 🙏❤️

Salam hangat,
*{panitia}*
Panitia Natal PAKSU 2026"""
    }
]

def normalize_phone(raw):
    if not raw:
        return ''
    raw = str(raw).strip()
    if 'E' in raw.upper():
        try:
            num = int(round(float(raw)))
            raw = str(num)
        except:
            pass
    cleaned = re.sub(r'[^0-9]', '', raw)
    if cleaned.startswith('0'):
        cleaned = '62' + cleaned[1:]
    elif cleaned.startswith('8'):
        cleaned = '62' + cleaned
    return cleaned

# Read excel
excel_path = r'c:\Users\charl\Downloads\List WA Blast.xlsx'
recipients = []
with zipfile.ZipFile(excel_path, 'r') as z:
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
            t = si.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
            if t is not None:
                shared_strings.append(t.text or '')
            else:
                texts = [elem.text for elem in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if elem.text]
                shared_strings.append(''.join(texts))

    sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
    rows = sheet_tree.findall(f'.//{ns}row')
    
    for row in rows[1:]:
        cells = {}
        for c in row.findall(f'{ns}c'):
            col = ''.join([ch for ch in c.attrib.get('r', '') if ch.isalpha()])
            t = c.attrib.get('t', '')
            v = c.find(f'{ns}v')
            val = v.text if v is not None else ''
            if t == 's' and val != '':
                val = shared_strings[int(val)]
            cells[col] = val
        nama = cells.get('B', '').strip()
        if not nama:
            continue
        no_urut = cells.get('A', '').strip()
        if no_urut.endswith('.0'):
            no_urut = no_urut[:-2]
        hp_raw = cells.get('C', '').strip()
        hp_clean = normalize_phone(hp_raw)
        update_raw = cells.get('E', '').strip()
        respon_raw = cells.get('F', '').strip()
        recipients.append({
            "no_urut": no_urut,
            "name": nama,
            "hp_raw": hp_raw,
            "hp_clean": hp_clean,
            "update_raw": update_raw,
            "respon_raw": respon_raw
        })

print(f"Total Recipients loaded: {len(recipients)}")

def escape_sql(val):
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''")
    return f"'{s}'"

sql_lines = []
sql_lines.append("-- Seed Script Generated Automatically")
sql_lines.append("BEGIN;")
sql_lines.append("TRUNCATE broadcast_logs, recipients, broadcast_waves, committee_members, event_settings RESTART IDENTITY CASCADE;")

# Insert event_settings
event_settings = [
    ("event_title", "Ibadah Natal Keluarga Besar Yayasan PAKSU 2026"),
    ("theme", "CHRIST'S AMBASSADOR"),
    ("verse", "Tetapi kamulah bangsa yang terpilih, ... umat kepunyaan Allah sendiri, supaya kamu memberitakan perbuatan-perbuatan yang besar dari Dia. (1 Petrus 2:9)"),
    ("speaker", "Pdt. Alex Nanlohy"),
    ("event_date", "Sabtu, 12 Desember 2026"),
    ("event_time", "17.00 WIB"),
    ("venue", "Gedung Seminar AB UKI Jakarta Timur"),
    ("website", "https://paksu.info"),
    ("maps_url", "https://maps.google.com/?q=Gedung+Seminar+AB+UKI+Jakarta+Timur")
]

for k, v in event_settings:
    sql_lines.append(f"INSERT INTO event_settings (key, value) VALUES ({escape_sql(k)}, {escape_sql(v)});")

# Insert committee members
for p in all_panitia:
    sql_lines.append(f"INSERT INTO committee_members (name, group_name) VALUES ({escape_sql(p['name'])}, {escape_sql(p['group'])});")

# Insert waves
for w in waves:
    sql_lines.append(f"INSERT INTO broadcast_waves (wave_number, title, scheduled_date, default_message_template) VALUES ({w['wave_number']}, {escape_sql(w['title'])}, {escape_sql(w['scheduled_date'])}, {escape_sql(w['template'])});")

# Assign recipients evenly among committee members (1-based id from 1 to 27)
num_panitia = len(all_panitia)
for idx, r in enumerate(recipients):
    panitia_id = (idx % num_panitia) + 1
    sql_lines.append(
        f"INSERT INTO recipients (no_urut, name, phone_raw, phone_clean, assigned_committee_id) "
        f"VALUES ({escape_sql(r['no_urut'])}, {escape_sql(r['name'])}, {escape_sql(r['hp_raw'])}, {escape_sql(r['hp_clean'])}, {panitia_id});"
    )

# Seed initial broadcast logs for all 3 waves for each recipient (id 1 to len(recipients))
for idx, r in enumerate(recipients):
    rec_id = idx + 1
    panitia_id = (idx % num_panitia) + 1
    
    # Map Wave 1 status from excel if present
    status_w1 = "Belum Terkirim"
    notes_w1 = ""
    up = r["update_raw"]
    res = r["respon_raw"]
    
    if res == "Hadir":
        status_w1 = "Konfirmasi Hadir"
    elif res == "Tidak Bisa Hadir":
        status_w1 = "Konfirmasi Tidak Bisa Hadir"
    elif res == "Tentative":
        status_w1 = "Terkirim Tidak Ada Respond"
        notes_w1 = "Tentative"
    elif up == "Terkirim, tidak ada respon":
        status_w1 = "Terkirim Tidak Ada Respond"
    elif "Tidak Terkirim" in up:
        status_w1 = "Tidak Terkirim"
    elif up == "Terkirim, ada respon":
        status_w1 = "Konfirmasi Hadir" if res == "Hadir" else "Terkirim Tidak Ada Respond"
    elif up == "Pengurus":
        status_w1 = "Belum Terkirim"
        notes_w1 = "Pengurus"

    # Insert Wave 1 log
    sql_lines.append(
        f"INSERT INTO broadcast_logs (recipient_id, wave_id, committee_id, status, notes) "
        f"VALUES ({rec_id}, 1, {panitia_id}, {escape_sql(status_w1)}, {escape_sql(notes_w1)});"
    )
    
    # Insert Wave 2 log
    sql_lines.append(
        f"INSERT INTO broadcast_logs (recipient_id, wave_id, committee_id, status, notes) "
        f"VALUES ({rec_id}, 2, {panitia_id}, 'Belum Terkirim', '');"
    )
    
    # Insert Wave 3 log
    sql_lines.append(
        f"INSERT INTO broadcast_logs (recipient_id, wave_id, committee_id, status, notes) "
        f"VALUES ({rec_id}, 3, {panitia_id}, 'Belum Terkirim', '');"
    )

sql_lines.append("COMMIT;")

with open("seed_data.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print("seed_data.sql created successfully!")
