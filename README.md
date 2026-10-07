# MongoDB User CRUD Demo

โปรเจกต์นี้เป็นตัวอย่างแอปจัดการผู้ใช้ (User Management) ที่ประกอบด้วย

- **Frontend:** HTML และ JavaScript ใน `public/index.html`
- **Backend:** Express และ TypeScript ใน `src/`
- **Database:** MongoDB Atlas ผ่าน Mongoose
- **Runtime:** รันตรงด้วย Node.js หรือรันเป็น Docker container

หน้าเว็บและ REST API อยู่ใน Express server ตัวเดียวกัน โดยหน้าเว็บเรียก API แล้ว API จึงอ่านหรือเขียนข้อมูลกับ MongoDB Atlas

## 1. ภาพรวมการทำงาน

```text
Browser
   │
   │  http://localhost:3000
   ▼
Express server (src/index.ts)
   │
   ├── เสิร์ฟหน้าเว็บจาก public/index.html
   ├── /health
   └── /api/users
          │
          ▼
      Mongoose model (src/User.ts)
          │
          ▼
      MongoDB Atlas
```

ลำดับการทำงานของการเพิ่มผู้ใช้คือ:

1. ผู้ใช้กรอกชื่อ อีเมล และรหัสผ่านในหน้าเว็บ
2. Frontend ส่ง `POST /api/users`
3. Backend ตรวจสอบข้อมูล
4. Backend hash รหัสผ่านด้วย Node `crypto.scrypt`
5. Mongoose บันทึกข้อมูลลง collection `users`
6. API ส่งข้อมูลผู้ใช้กลับ โดยไม่ส่ง password กลับไป

## 2. โครงสร้างไฟล์

```text
test/
├── public/
│   └── index.html          # หน้าเว็บและ JavaScript ฝั่ง browser
├── src/
│   ├── index.ts            # สร้าง Express server และเชื่อม MongoDB
│   ├── User.ts             # Mongoose schema/model ของ User
│   ├── UserController.ts   # ฟังก์ชัน CRUD และ validation
│   ├── UserRoutes.ts       # เส้นทาง REST API
│   ├── Calculator.ts       # ตัวอย่าง module สำหรับการทดสอบ
│   ├── Utils.ts            # utility functions
│   ├── Test1.ts            # unit test
│   └── IntegrationTest.ts  # integration test
├── .env.example            # ตัวอย่าง environment variables ที่ไม่มี credential จริง
├── .env                    # ค่าจริงของเครื่อง ห้าม commit
├── dockerfile               # ขั้นตอนสร้าง Docker image
├── .dockerignore            # ไฟล์ที่ไม่ต้องส่งเข้า Docker build context
├── package.json             # scripts และ dependencies
├── tsconfig.json            # การตั้งค่า TypeScript
└── dist/                    # JavaScript ที่สร้างจาก TypeScript
```

`src/` คือ source code ที่เราแก้ไข ส่วน `dist/` เป็นไฟล์ที่เกิดจากคำสั่ง build ไม่ควรแก้โดยตรง

## 3. สิ่งที่ต้องติดตั้งก่อน

สำหรับการรันแบบปกติ ต้องมี:

- Node.js และ npm
- บัญชี MongoDB Atlas
- MongoDB Atlas Cluster
- Database User ใน Atlas
- IP ของเครื่องที่อยู่ใน Atlas Network Access

สำหรับการรันผ่าน Docker ต้องมีเพิ่ม:

- Docker Desktop
- Docker daemon เปิดอยู่

MongoDB ที่โปรเจกต์นี้ใช้คือ **MongoDB Atlas** ไม่ใช่ PostgreSQL container ที่อาจแสดงอยู่ใน `docker ps` และไม่ใช่ MongoDB local ที่ `localhost:27017`

## 4. ตั้งค่า MongoDB Atlas

### 4.1 สร้าง Database User

ใน MongoDB Atlas ไปที่:

```text
Database & Network Access → Database Users → Add New Database User
```

จดจำสองค่า:

- Username ของ Database User
- Password ของ Database User

Database User เป็นคนละบัญชีกับอีเมลที่ใช้ล็อกอิน MongoDB Atlas

### 4.2 อนุญาต IP เครื่อง

ไปที่:

```text
Database & Network Access → Network Access → IP Access List
```

เพิ่ม public IP ของเครื่องที่ใช้รันแอปและ MongoDB Compass

### 4.3 คัดลอก Connection String

ในหน้า Cluster เลือก:

```text
Connect → MongoDB Compass
```

หรือเลือก connection string สำหรับ application แล้วนำมาใส่ใน `.env`

อย่าเผยแพร่ connection string เพราะอาจมี username และ password อยู่ในนั้น

## 5. ตั้งค่าไฟล์ `.env`

สร้างไฟล์ `.env` จาก `.env.example`

### PowerShell

```powershell
Copy-Item .env.example .env
```

จากนั้นเปิด `.env` แล้วแก้ค่าให้เป็นของจริง:

```dotenv
PORT=3000
MONGODB_URI=mongodb+srv://<database-user>:<database-password>@<cluster-host>/<database-name>?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:3000
```

ข้อควรระวัง:

- ห้ามมีช่องว่างหลัง `MONGODB_URI=`
- ใช้ password ของ **Database User** ไม่ใช่ password ของ Atlas Account
- ถ้า password มีอักขระพิเศษ เช่น `@`, `#`, `/` หรือ `:` ต้อง URL-encode หรือใช้ connection string ที่ Atlas สร้างให้
- ห้ามนำ `MONGODB_URI` ไปใส่ใน frontend
- ห้าม commit หรือส่งไฟล์ `.env`

ตัวอย่างที่ไม่ถูกต้อง:

```dotenv
MONGODB_URI= mongodb+srv://...
```

ตัวอย่างที่ถูกต้อง:

```dotenv
MONGODB_URI=mongodb+srv://...
```

## 6. ติดตั้ง dependencies

เปิด Terminal ที่โฟลเดอร์โปรเจกต์:

```powershell
npm.cmd install
```

บน Windows หาก `npm` หรือ `npx` ถูก PowerShell policy บล็อก ให้ใช้ `.cmd` เช่น `npm.cmd` และ `npx.cmd`

## 7. รันแบบปกติด้วย Node.js

### Build TypeScript

```powershell
npm.cmd run build
```

คำสั่งนี้จะแปลงไฟล์จาก `src/*.ts` ไปเป็น `dist/*.js`

### รัน production-style server

```powershell
npm.cmd run start:server
```

คำสั่งนี้จะ build ก่อน แล้วรัน `dist/index.js` พร้อมโหลด `.env`

### รัน development server

```powershell
npm.cmd run dev:server
```

เมื่อแก้ไฟล์ใน `src/` หรือ `public/` จะ build และ restart server อัตโนมัติผ่าน nodemon

เปิดหน้าเว็บที่:

```text
http://localhost:3000
```

หมายเหตุ: ใน `package.json` ใช้ชื่อ script `start:server` ไม่ใช่ `start` ดังนั้นอย่าใช้ `npm run start`

## 8. รันผ่าน Docker

### 8.1 ตรวจว่า Docker พร้อมใช้งาน

```cmd
docker info
```

ถ้า Docker daemon ยังไม่ทำงาน ให้เปิด Docker Desktop แล้วรอจนสถานะพร้อม

### 8.2 สร้าง image

```cmd
docker build -f dockerfile -t test-api:v1 .
```

ความหมายของคำสั่ง:

- `-f dockerfile` ระบุไฟล์สำหรับ build
- `-t test-api:v1` ตั้งชื่อ image เป็น `test-api` และ tag เป็น `v1`
- `.` ใช้โฟลเดอร์ปัจจุบันเป็น build context

Dockerfile นี้มี 2 stages:

1. **build stage:** ติดตั้ง dependencies ทั้งหมดและ compile TypeScript
2. **runtime stage:** ใช้เฉพาะ production dependencies กับไฟล์ใน `dist/`

### 8.3 สร้างและรัน container ที่พอร์ต 3000

ใช้คำสั่งบรรทัดเดียวเพื่อป้องกันปัญหา PowerShell กับ Command Prompt:

```cmd
docker run -d --name test-api -p 127.0.0.1:3000:3000 --env-file .env test-api:v1
```

ความหมายของ port mapping คือ:

```text
พอร์ตเครื่อง host : พอร์ตใน container
127.0.0.1:3000    : 3000
```

เปิดเว็บที่:

```text
http://localhost:3000
```

### 8.4 รันหน้าเว็บเดียวกันที่พอร์ต 3001

ถ้าต้องการให้หน้าเว็บเดียวกันเปิดได้ทั้ง 3000 และ 3001 ให้สร้าง container อีกตัวจาก image เดิม:

```cmd
docker run -d --name test-api-3001 -p 127.0.0.1:3001:3000 --env-file .env test-api:v1
```

เปิดได้ที่:

```text
http://localhost:3000
http://localhost:3001
```

นี่คือการรันแอปเดียวกันสอง instance ไม่ใช่ microservice สองประเภท ทั้งสอง container ใช้ image เดียวกันและเชื่อม MongoDB Atlas ฐานเดียวกัน

### 8.5 ตรวจสอบ container

```cmd
docker ps
```

ดู log ล่าสุด:

```cmd
docker logs --since 1m test-api
docker logs --since 1m test-api-3001
```

ติดตาม log แบบต่อเนื่อง:

```cmd
docker logs -f test-api
```

กด `Ctrl+C` เพื่อหยุดการดู log เท่านั้น ไม่ได้หยุด container

ถ้าต้องการหยุด container:

```cmd
docker stop test-api
docker stop test-api-3001
```

ถ้าต้องการเริ่ม container เดิม:

```cmd
docker start test-api
docker start test-api-3001
```

ถ้าแก้ `.env` ต้องสร้าง container ใหม่ เพราะ `--env-file` ถูกอ่านตอนสร้างหรือเริ่มคำสั่ง `docker run` ไม่ได้เปลี่ยนตามไฟล์อัตโนมัติ

## 9. ทดสอบระบบ

### 9.1 Health check

```cmd
curl http://127.0.0.1:3000/health
```

ผลลัพธ์ที่คาดหวัง:

```text
OK
```

ทดสอบ instance ที่พอร์ต 3001:

```cmd
curl http://127.0.0.1:3001/health
```

### 9.2 อ่านรายชื่อผู้ใช้

```cmd
curl http://127.0.0.1:3000/api/users
```

API จะไม่ส่ง field `password` กลับมา

### 9.3 เพิ่มผู้ใช้

```cmd
curl -X POST http://127.0.0.1:3000/api/users -H "Content-Type: application/json" -d "{\"name\":\"Alice\",\"email\":\"alice@example.com\",\"password\":\"secret123\"}"
```

ผลลัพธ์ที่คาดหวังคือ status `201 Created` และข้อมูลผู้ใช้ที่ไม่มี password

เงื่อนไขสำคัญ:

- `name` ต้องไม่ว่าง
- `email` ต้องไม่ว่าง
- `password` ต้องมีอย่างน้อย 6 ตัวอักษร
- email ซ้ำจะได้ status `409`

### 9.4 ดูผู้ใช้คนเดียว

แทนที่ `<id>` ด้วยค่า `_id` ที่ได้จาก API:

```cmd
curl http://127.0.0.1:3000/api/users/<id>
```

### 9.5 แก้ไขผู้ใช้

```cmd
curl -X PUT http://127.0.0.1:3000/api/users/<id> -H "Content-Type: application/json" -d "{\"name\":\"Alice Updated\",\"email\":\"alice.updated@example.com\"}"
```

### 9.6 ลบผู้ใช้

```cmd
curl -X DELETE http://127.0.0.1:3000/api/users/<id>
```

ผลลัพธ์ที่สำเร็จคือ status `204 No Content`

## 10. ใช้ MongoDB Compass ดูข้อมูล

โปรเจกต์นี้เชื่อมกับ MongoDB Atlas ดังนั้นใน Compass ต้องใช้ Atlas connection string ไม่ใช่ค่าเริ่มต้น:

```text
mongodb://localhost:27017/
```

ขั้นตอน:

1. เปิด MongoDB Atlas แล้วไปที่ Cluster → **Connect** → **MongoDB Compass**
2. Copy connection string
3. เปิด Compass → **New Connection**
4. วาง connection string ลงในช่อง URI
5. ตรวจสอบว่าใช้ Database User ถูกต้อง
6. กด **Save & Connect**
7. เปิด database และ collection `users`

Database User ใน Atlas ไม่ใช่บัญชีอีเมลที่ใช้ล็อกอิน Atlas หากขึ้น `authentication failed` ให้ตรวจ username และ password ของ Database User รวมถึง connection string ที่ Compass บันทึกไว้

ถ้าเปลี่ยน password ใน Atlas ต้องแก้ `.env` และสร้าง Docker container ใหม่ด้วย

## 11. REST API Reference

Base URL:

```text
http://localhost:3000
```

| Method | Endpoint | ใช้ทำอะไร | Success status |
| --- | --- | --- | --- |
| GET | `/health` | ตรวจว่า server ทำงาน | `200` |
| GET | `/api/users` | อ่านผู้ใช้ทั้งหมด | `200` |
| POST | `/api/users` | เพิ่มผู้ใช้ | `201` |
| GET | `/api/users/:id` | อ่านผู้ใช้หนึ่งคน | `200` |
| PUT | `/api/users/:id` | แก้ไขชื่อ อีเมล หรือ password | `200` |
| DELETE | `/api/users/:id` | ลบผู้ใช้ | `204` |

Error status ที่พบบ่อย:

| Status | ความหมาย |
| --- | --- |
| `400` | ข้อมูลไม่ครบ, password สั้น หรือ id ไม่ถูกต้อง |
| `404` | ไม่พบผู้ใช้ |
| `409` | email ซ้ำ |
| `500` | เกิดข้อผิดพลาดฝั่ง server หรือ database |

## 12. การทดสอบ TypeScript

Build และตรวจ type:

```powershell
npm.cmd run build
npx.cmd tsc --noEmit
```

Unit tests:

```powershell
npm.cmd run test:unit
```

Integration tests:

```powershell
npm.cmd run test:integration
```

รันชุดทดสอบหลัก:

```powershell
npm.cmd test
```

`test:unit` และ `test:integration` ใช้ไฟล์ JavaScript ใน `dist/` ดังนั้นควร build ก่อนรันทดสอบหลังจากแก้ไฟล์ TypeScript

## 13. ปัญหาที่พบบ่อย

### `npm error Missing script: "start"`

โปรเจกต์นี้ไม่มี script ชื่อ `start` ให้ใช้:

```powershell
npm.cmd run start:server
```

### `MongoParseError: Invalid scheme`

ตรวจว่า `MONGODB_URI` เริ่มด้วย:

```text
mongodb://
```

หรือ:

```text
mongodb+srv://
```

และไม่มีช่องว่างหลัง `MONGODB_URI=`

### `MongooseServerSelectionError` หรือ IP ไม่ได้รับอนุญาต

ไปที่ MongoDB Atlas → Network Access แล้วเพิ่ม public IP ของเครื่อง จากนั้นรอให้ Atlas ใช้รายการ IP ใหม่ แล้ว restart/recreate container

### `authentication failed` ใน Compass

ตรวจตามลำดับนี้:

1. ใช้ Database User ไม่ใช่ Atlas Account
2. username ตรงกันทุกตัวอักษร
3. password ถูกต้อง
4. Compass ไม่ได้เก็บ password เก่าไว้
5. ใช้ connection string จาก Atlas หรือ `.env` โดยตรง
6. ถ้า password มีอักขระพิเศษ ให้ URL-encode

### `docker: invalid reference format`

มักเกิดจากใช้รูปแบบขึ้นบรรทัดไม่ตรงกับ shell เช่นใช้ backtick ของ PowerShell ใน Command Prompt แนะนำให้ใช้คำสั่ง Docker แบบบรรทัดเดียว หรือถ้าใช้ Command Prompt ให้ใช้ `^`

### เปิดเว็บไม่ได้เพราะพอร์ตถูกใช้แล้ว

ตรวจสอบ:

```cmd
docker ps
```

ถ้าพอร์ต 3000 ถูกใช้แล้ว ให้ใช้พอร์ต host อื่น เช่น:

```cmd
docker run -d --name test-api-3001 -p 127.0.0.1:3001:3000 --env-file .env test-api:v1
```

### `docker ps` ไม่เห็น container

`docker ps` แสดงเฉพาะ container ที่กำลังทำงาน ให้ดูทั้งหมดด้วย:

```cmd
docker ps -a
```

## 14. Security checklist

- เก็บ credential ใน `.env` เท่านั้น
- ไม่ commit `.env`
- ไม่ใส่ `MONGODB_URI` ใน frontend
- ไม่ส่ง password กลับจาก API
- ไม่แชร์ connection string ใน screenshot หรือแชต
- หาก credential จริงเคยอยู่ใน `.env.example`, Git commit หรือถูกแชร์แล้ว ให้เปลี่ยน password ของ Database User ใน Atlas
- ใช้สิทธิ์ของ Database User เท่าที่จำเป็นเมื่อขึ้น production

## 15. Verification checklist

ก่อนสรุปว่าโปรเจกต์พร้อมใช้งาน ให้ตรวจดังนี้:

```powershell
npm.cmd run build
npm.cmd run test:unit
npm.cmd run test:integration
```

ถ้ารันด้วย Docker ให้ตรวจเพิ่ม:

```cmd
docker ps
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/api/users
```

และเปิดหน้าเว็บที่ `http://localhost:3000` เพื่อทดลองเพิ่ม แก้ไข และลบผู้ใช้จาก frontend จริง
