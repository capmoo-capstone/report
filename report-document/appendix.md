# ภาคผนวก (Appendices)

## ภาคผนวก ก – แผนภาพ
นอกเหนือจากแผนภาพการทำงานหลักที่ได้นำเสนอไว้ในบทที่ 3 และบทที่ 4 แล้ว โครงงาน NexusProcure ยังมีการออกแบบแผนภาพ activity และแผนภาพ sequence เพื่อใช้อธิบายขั้นตอนการปฏิบัติงานในระบบอย่างละเอียด ซึ่งประกอบด้วยแผนภาพดังต่อไปนี้

### ภาพที่ ก.1 Project Creation Activity Diagram
ภาพแสดงลำดับการตัดสินใจและขั้นตอนเมื่อผู้ใช้งานสร้างโครงการใหม่ผ่านการดึงข้อมูลจากแผนงบประมาณ หรือกรอกข้อมูลด้วยตนเอง
![03-project-creation-activity](https://github.com/capmoo-capstone/report/blob/main/report-diagrams/03-project-creation-activity.png)

### ภาพที่ ก.2 Job Assignment Activity Diagram
ภาพแสดงวิธีการกระจายงานเข้าสู่ระบบงานกลาง และการรับงานของเจ้าหน้าที่พัสดุ
![04-job-assignment-activity](https://github.com/capmoo-capstone/report/blob/main/report-diagrams/04-job-assignment-activity.png)

### ภาพที่ ก.3 Procurement Workflow Activity Diagram
ภาพแสดงรายละเอียดขั้นตอนการดำเนินงานในวงจรจัดซื้อจัดจ้าง ตั้งแต่เริ่มต้นจนสิ้นสุดกระบวนการ
![05-procurement-workflow-activity](https://github.com/capmoo-capstone/report/blob/main/report-diagrams/05-procurement-workflow-activity.png)

### ภาพที่ ก.4 Vendor Submission Sequence Diagram
ภาพแสดงการติดต่อสื่อสารระหว่างระบบหน้าบ้านและระบบหลังบ้าน เมื่อผู้ขายทำการเข้าสู่ระบบผ่านการใช้เลขที่ใบสั่งซื้อ (PO) และอัปโหลดไฟล์ส่งมอบงาน
![18-vendor-submission-sequence](https://github.com/capmoo-capstone/report/blob/main/report-diagrams/18-vendor-submission-sequence.png)

## ภาคผนวก ข – โค้ดต้นฉบับ
ส่วนนี้แสดงตัวอย่าง source Code ที่เป็นหัวใจสำคัญของการทำงานในระบบ NexusProcure

**1. ตัวอย่างการใช้ Zod สำหรับตรวจสอบความถูกต้องของข้อมูล**
ตัวอย่างโค้ดในไฟล์ `project.schema.ts` ที่ใช้ในการตรวจสอบข้อมูลการนำเข้าโครงการ ป้องกันข้อมูลที่ไม่ถูกต้อง เช่น วงเงินติดลบ
```typescript
export const importProjectSchema = z.object({
  receive_no: z.string().min(1, 'Receive number is required'),
  title: z.string().min(1, 'Project title is required'),
  budget: z.coerce.number().positive('Budget must be positive'),
  expected_delivery_date: z.coerce.date().min(new Date(), 'Date must be in the future'),
  requesting_unit_id: z.string().min(1, 'Requesting unit is required'),
});
```

**2. ตัวอย่างตรรกะการจัดการสิทธิ์ผู้ใช้งาน**
ตัวอย่างฟังก์ชันส่วนกลางใน `permissions.ts` ที่ใช้ตรวจเช็กสิทธิ์ว่าผู้ใช้งานมีอำนาจในการอนุมัติสัญญาหรือไม่
```typescript
export const canPerformProjectCompleteContract = (user: User | null | undefined) =>
  hasSupplyRole(user, ['FINANCE_STAFF']);

export const canPerformProjectAssign = (
  user: User | null | undefined,
  context?: PermissionContext
) => hasResponsibleUnitRole(user, ['HEAD_OF_UNIT'], context);
```

**3. ตัวอย่างการใช้ transaction ควบคุมความสมบูรณ์ของสถานะโครงการ**
ตัวอย่างฟังก์ชันใน `project-lifecycle.service.ts` ที่ใช้ Prisma Transaction ป้องกันไม่ให้สถานะโครงการผิดเพี้ยนระหว่างการประมวลผล
```typescript
export const cancelProject = async (
  user: AuthPayload,
  data: CancelProjectDto
): Promise<ProjectCancellationResponse> => {
  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: { id: data.id },
      select: { status: true },
    });
    
    if (!project) throw new NotFoundError('Project not found');
    
    // ตรรกะการตรวจสอบและเปลี่ยนสถานะอย่างรัดกุม...
```

## ภาคผนวก ค – ข้อมูลการทดสอบเพิ่มเติม
คณะผู้จัดทำได้ออกแบบกรณีทดสอบ ให้ครอบคลุมทั้ง 3 ระดับ ได้แก่ P0, P1 และ P2 โดยอิงตาม business logic ของฝ่ายการพัสดุ สบง. ตัวอย่างของ critical cases มีดังนี้:

| รหัสการทดสอบ | ฟังก์ชัน | รายละเอียดกรณีทดสอบ (Test Case) | ระดับความสำคัญ | ผลการทดสอบ |
| :--- | :--- | :--- | :---: | :---: |
| TC-001 | Authentication | ตรวจสอบการปฏิเสธการเข้าถึงหน้าจอจัดการโครงการ หากเข้าสู่ระบบด้วยสิทธิ์ผู้แทนหน่วยงาน | P0 | ผ่าน |
| TC-002 | Project Import | การนำเข้าไฟล์ Excel ต้องแจ้งเตือน หากยอดรวมงบประมาณน้อยกว่าที่ระบุ | P0 | ผ่าน |
| TC-003 | Project Import | การนำเข้าไฟล์ Excel ต้องปฏิเสธข้อมูล หากพบเลขที่ใบขอซื้อขอจ้างซ้ำซ้อนในฐานข้อมูล | P0 | ผ่าน |
| TC-004 | Assignment Pool | ห้ามเจ้าหน้าที่รับงานซ้ำซ้อนในโครงการที่ตนเองเป็นผู้รับผิดชอบอยู่แล้ว | P0 | ผ่าน |
| TC-005 | State Machine | โครงการไม่สามารถเข้าสู่ขั้นตอน "บริหารสัญญา" ได้ หากผู้มีอำนาจยังไม่กด "อนุมัติจบงานจัดซื้อ" | P0 | ผ่าน |
| TC-006 | Document Upload | ระบบต้องอนุญาตให้อัปโหลดเอกสารผ่าน Presigned URL เข้า Cloudflare R2 ได้สำเร็จ | P0 | ผ่าน |

*(หมายเหตุ: กรณีทดสอบทั้งหมดมีจำนวน 350 กรณี ซึ่งได้รับการจัดเก็บไว้ในฐานข้อมูลการทดสอบภายในทีมผู้จัดทำ)*

## ภาคผนวก ง – ภาพหน้าจอระบบเพิ่มเติม
เนื่องจากระบบ NexusProcure มีหน้าจอการทำงานจำนวนมากครอบคลุมผู้ใช้งานหลายกลุ่ม คณะผู้จัดทำจึงได้รวบรวมภาพหน้าจอเพิ่มเติมที่อยู่นอกเหนือจากระบบงานหลักที่แสดงในบทที่ 4 มาแสดงไว้ในส่วนนี้ เพื่อเป็นหลักฐานของความสมบูรณ์ในการพัฒนาระบบ

1. ระบบจัดการสำหรับผู้ดูแลระบบ
หน้าจอสำหรับจัดการโครงสร้างองค์กร บทบาท และสิทธิ์ของผู้ใช้งานในระบบ
    - ภาพหน้าจอการจัดการผู้ใช้งาน บทบาท และโครงสร้างองค์กร (Organization & Roles Management)
    - ภาพหน้าจอการนำเข้าแผนงบประมาณผ่านไฟล์ Excel (Budget Plan Import)

2. ระบบตรวจสอบและเครื่องมือสำหรับผู้บริหาร
หน้าจอสำหรับการประเมินและติดตามภาพรวมของระบบและบุคลากร
    - ภาพหน้าจอแสดงบันทึกการทำงานของระบบ (Audit Logs)
    - ภาพหน้าจอแสดงภาระงานของทีมพัสดุ (Staff Workload View)
    - ภาพหน้าจอการตั้งค่าผู้รับมอบอำนาจหรือรักษาการแทน (Delegation)

3. ระบบสำหรับฝ่ายการเงิน
หน้าจอเฉพาะสำหรับเจ้าหน้าที่การเงินในการจัดการข้อมูลที่เกี่ยวข้องกับงบประมาณ
    - ภาพหน้าจอการส่งออกข้อมูลการเงิน (Finance Export)

4. ระบบสำหรับบุคคลภายนอก
หน้าจอสำหรับบริษัทคู่ค้าในการยื่นเอกสารเข้าสู่ระบบโดยตรง
    - ภาพหน้าจอแบบฟอร์มสำหรับยื่นเอกสารส่งมอบงาน (Vendor Submission Form)

## ภาคผนวก จ – เอกสารคู่มือ API
ระบบ NexusProcure มีการจัดทำเอกสารคู่มือ API โดยใช้ Swagger UI เป็นเครื่องมือหลัก ซึ่งทำให้ทีมพัฒนาระบบหน้าบ้านและหลังบ้านสามารถทำงานร่วมกันได้อย่างเป็นมาตรฐาน โดย API ประกอบไปด้วย endpoints หลักดังนี้:

- `/api/auth/*` - สำหรับการตรวจสอบและออก JWT
- `/api/projects/*` - สำหรับจัดการโครงการ นำเข้าข้อมูล และการเปลี่ยนผู้รับผิดชอบ
- `/api/submissions/*` - สำหรับจัดการขั้นตอนการจัดซื้อและอัปโหลดไฟล์
- `/api/users/*` - สำหรับดึงข้อมูลรายชื่อพนักงานและการจัดการสิทธิ์
- `/api/storage/*` - สำหรับสร้าง Presigned URL เพื่อเชื่อมต่อ Cloudflare R2