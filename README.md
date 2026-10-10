# เว็บไซต์ bcsm1989.com

## ก่อนอัปโหลด
- ค้นหา `08X-XXX-XXXX` ในทุกไฟล์ .html แล้วแทนด้วยเบอร์จริง
- Cloudflare → Email Routing เพิ่มที่อยู่ `privacy@` และ `support@` ให้ส่งต่อเข้า Gmail
- ตรวจหน้า /privacy/ และ /delete-account/ ให้ตรงกับที่แอป Gramick ทำได้จริง (เมนูลบบัญชี, ข้อมูลที่เก็บ)

## อัปขึ้น GitHub Pages
1. github.com → New repository ชื่อ `bcsm1989-site` (Public)
2. Add file → Upload files → ลากไฟล์และโฟลเดอร์ทั้งหมดในโฟลเดอร์นี้ขึ้นไป → Commit
3. Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)` → Save
4. Custom domain: `bcsm1989.com` → Save

## ตั้ง DNS ใน Cloudflare (DNS → Records → Add record)
| Type | Name | Content | Proxy |
|---|---|---|---|
| A | @ | 185.199.108.153 | DNS only (เมฆเทา) |
| A | @ | 185.199.109.153 | DNS only |
| A | @ | 185.199.110.153 | DNS only |
| A | @ | 185.199.111.153 | DNS only |
| CNAME | www | <ชื่อผู้ใช้ GitHub>.github.io | DNS only |

ไม่ต้องแตะระเบียน MX/TXT ของอีเมล

5. รอ 10–30 นาที กลับไป GitHub → Settings → Pages → ติ๊ก **Enforce HTTPS**

## ลิงก์ที่ใช้กรอกในสโตร์
- Website / Marketing URL: https://bcsm1989.com
- Support URL: https://bcsm1989.com/support/
- Privacy Policy URL: https://bcsm1989.com/privacy/
- Account deletion URL (Google Play): https://bcsm1989.com/delete-account/
