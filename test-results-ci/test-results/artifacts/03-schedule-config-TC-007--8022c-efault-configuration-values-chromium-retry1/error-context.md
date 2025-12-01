# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - link "ระบบจัดตารางเรียนตารางสอน" [ref=e5] [cursor=pointer]:
          - /url: /
          - heading "ระบบจัดตารางเรียนตารางสอน" [level=1] [ref=e6]
        - list [ref=e7]:
          - listitem [ref=e8]:
            - link "จัดการ" [ref=e9] [cursor=pointer]:
              - /url: /management
              - paragraph [ref=e10]: จัดการ
          - listitem [ref=e11]:
            - link "สรุปข้อมูล" [ref=e12] [cursor=pointer]:
              - /url: /dashboard/select-semester
              - paragraph [ref=e13]: สรุปข้อมูล
      - generic [ref=e14]:
        - button "เลือกภาคเรียน" [ref=e15] [cursor=pointer]:
          - img [ref=e17]
          - text: เลือกภาคเรียน
        - generic [ref=e19]:
          - img "profile_pic" [ref=e21] [cursor=pointer]
          - generic [ref=e22]:
            - paragraph [ref=e23]: System Administrator
            - paragraph [ref=e26]: ผู้ดูแลระบบ
          - button "ออกจากระบบ" [ref=e27]:
            - img [ref=e28]
  - generic [ref=e34]:
    - progressbar [ref=e35]:
      - img [ref=e36]
    - paragraph [ref=e38]: กำลังโหลดข้อมูล... ระบบกำลังดึงภาคเรียนล่าสุด โปรดรอสักครู่
  - alert [ref=e39]
```