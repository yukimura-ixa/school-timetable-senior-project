import type { Metadata } from "next";
import Link from "next/link";
import { createMetadataWithSocial } from "@/utils/canonical-url";

export const metadata: Metadata = createMetadataWithSocial({
  title: "นโยบายความเป็นส่วนตัว - ระบบตารางเรียนโรงเรียนพระซองสามัคคีวิทยา",
  description:
    "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคล ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) โรงเรียนพระซองสามัคคีวิทยา ระบุสิทธิผู้ใช้ การเก็บรักษาข้อมูล และมาตรการรักษาความปลอดภัย",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        นโยบายความเป็นส่วนตัว
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-sm text-gray-600 mb-8">
          <strong>วันที่มีผลบังคับใช้:</strong> 7 เมษายน 2569 (7 April 2026)
          <br />
          <strong>ปรับปรุงล่าสุด:</strong> 7 เมษายน 2569
        </p>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            1. บทนำ
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            โรงเรียนพระซองสามัคคีวิทยา ("โรงเรียน" หรือ "เรา") ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน 
            นโยบายความเป็นส่วนตัวฉบับนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ เปิดเผย และคุ้มครองข้อมูลส่วนบุคคลของท่าน
            ผ่านระบบตารางเรียนตารางสอนออนไลน์ ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (Personal Data Protection Act - PDPA)
          </p>
          <p className="text-gray-700 leading-relaxed">
            การใช้งานระบบตารางเรียนตารางสอนของโรงเรียนนี้ ถือว่าท่านได้อ่าน เข้าใจ และยอมรับนโยบายความเป็นส่วนตัวนี้แล้ว
          </p>
        </section>

        {/* Data Controller */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            2. ผู้ควบคุมข้อมูลส่วนบุคคล
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold text-gray-800">โรงเรียนพระซองสามัคคีวิทยา</p>
            <p className="text-gray-700 mt-2">
              สังกัด: สำนักงานเขตพื้นที่การศึกษามัธยมศึกษานครพนม
              <br />
              จังหวัด: นครพนม
              <br />
              เว็บไซต์: <a href="http://www.phrasong.ac.th/mainpage" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.phrasong.ac.th</a>
              <br />
              Facebook: <a href="https://www.facebook.com/phrasongschool" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">facebook.com/phrasongschool</a>
            </p>
          </div>
        </section>

        {/* Data Collection */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            3. ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม
          </h2>
          <p className="mb-4 text-gray-700">
            เราเก็บรวบรวมข้อมูลส่วนบุคคลดังต่อไปนี้:
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            3.1 ข้อมูลบัญชีผู้ใช้งาน
          </h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>ชื่อ-นามสกุล</li>
            <li>อีเมล (Email address)</li>
            <li>บทบาทในระบบ (ครู, นักเรียน, ผู้ดูแลระบบ)</li>
            <li>รหัสผ่านที่เข้ารหัสแล้ว (Encrypted password)</li>
            <li>วันที่สร้างบัญชีและเข้าสู่ระบบล่าสุด</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            3.2 ข้อมูลการจัดตารางเรียนตารางสอน
          </h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>ข้อมูลครูผู้สอน (ชื่อ, รหัสครู, ภาควิชา)</li>
            <li>ข้อมูลชั้นเรียน (ระดับชั้น, ห้องเรียน, จำนวนนักเรียน)</li>
            <li>ข้อมูลวิชาที่สอน (รหัสวิชา, ชื่อวิชา, หน่วยกิต)</li>
            <li>ตารางเรียนตารางสอน (วัน, เวลา, ห้องเรียน)</li>
            <li>การจัดสรรครูผู้สอนในแต่ละวิชา</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            3.3 ข้อมูลการใช้งานระบบ
          </h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>ข้อมูลการเข้าสู่ระบบ (Login logs)</li>
            <li>IP Address และข้อมูลเบราว์เซอร์</li>
            <li>หน้าเว็บที่เข้าชม และระยะเวลาการใช้งาน</li>
            <li>การกระทำภายในระบบ (เช่น การดูตารางเรียน, การค้นหา)</li>
          </ul>
        </section>

        {/* Purpose of Data Collection */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            4. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล
          </h2>
          <p className="mb-4 text-gray-700">
            เราเก็บรวบรวมและใช้ข้อมูลส่วนบุคคลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>
              <strong>การจัดการตารางเรียนตารางสอน:</strong> เพื่อสร้าง จัดการ และแสดงตารางเรียนตารางสอนของครูและนักเรียน
            </li>
            <li>
              <strong>การยืนยันตัวตนและความปลอดภัย:</strong> เพื่อตรวจสอบสิทธิ์การเข้าใช้งานและป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
            </li>
            <li>
              <strong>การให้บริการระบบ:</strong> เพื่อให้บริการค้นหาตารางเรียน ดูข้อมูลครู และข้อมูลชั้นเรียน
            </li>
            <li>
              <strong>การปรับปรุงระบบ:</strong> เพื่อวิเคราะห์การใช้งานและพัฒนาระบบให้ดีขึ้น
            </li>
            <li>
              <strong>การสื่อสารที่จำเป็น:</strong> เพื่อแจ้งข่าวสาร การเปลี่ยนแปลงตารางเรียน หรือข้อมูลสำคัญที่เกี่ยวข้อง
            </li>
            <li>
              <strong>การปฏิบัติตามกฎหมาย:</strong> เพื่อปฏิบัติตามข้อกำหนดทางกฎหมายและระเบียบของสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)
            </li>
          </ul>
        </section>

        {/* Legal Basis */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            5. ฐานทางกฎหมายในการประมวลผลข้อมูล
          </h2>
          <p className="mb-4 text-gray-700">
            เราประมวลผลข้อมูลส่วนบุคคลของท่านภายใต้ฐานทางกฎหมายดังต่อไปนี้:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>
              <strong>การปฏิบัติหน้าที่ตามกฎหมาย:</strong> การจัดการศึกษาและการบริหารจัดการโรงเรียนตามพระราชบัญญัติการศึกษาแห่งชาติ
            </li>
            <li>
              <strong>ประโยชน์โดยชอบด้วยกฎหมาย:</strong> การบริหารจัดการตารางเรียนตารางสอนเพื่อประโยชน์ของโรงเรียนและผู้ใช้งาน
            </li>
            <li>
              <strong>ความยินยอม:</strong> ท่านได้ให้ความยินยอมในการใช้งานระบบและการประมวลผลข้อมูลตามนโยบายนี้
            </li>
          </ul>
        </section>

        {/* Data Storage and Security */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            6. การเก็บรักษาและความปลอดภัยของข้อมูล
          </h2>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            6.1 สถานที่เก็บข้อมูล
          </h3>
          <p className="mb-4 text-gray-700">
            ข้อมูลของท่านถูกเก็บรักษาในระบบฐานข้อมูล Vercel Postgres ที่มีมาตรฐานความปลอดภัยสูง 
            โดยเซิร์ฟเวอร์อาจตั้งอยู่ในสหรัฐอเมริกาหรือประเทศอื่นๆ ที่มีมาตรฐานความปลอดภัยเทียบเท่า
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            6.2 มาตรการรักษาความปลอดภัย
          </h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>การเข้ารหัสข้อมูล (Data encryption) ทั้งระหว่างการส่งข้อมูลและการเก็บข้อมูล</li>
            <li>การเข้ารหัสรหัสผ่านด้วย bcrypt algorithm</li>
            <li>การใช้ HTTPS/TLS สำหรับการสื่อสารที่ปลอดภัย</li>
            <li>การควบคุมการเข้าถึงข้อมูลด้วยระบบสิทธิ์ตามบทบาท (Role-based access control)</li>
            <li>Security headers เพื่อป้องกันภัยคุกคามทางไซเบอร์</li>
            <li>การสำรองข้อมูลสม่ำเสมอ (Regular backups)</li>
            <li>การติดตามและบันทึกการเข้าถึงข้อมูล (Access logging)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            6.3 ระยะเวลาการเก็บรักษา
          </h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>
              <strong>ข้อมูลบัญชีผู้ใช้:</strong> เก็บไว้ตลอดระยะเวลาที่บัญชีมีสถานะใช้งานอยู่ 
              หรือจนกว่าจะมีการร้องขอลบข้อมูล
            </li>
            <li>
              <strong>ข้อมูลตารางเรียน:</strong> เก็บไว้เป็นระยะเวลา 3 ปีการศึกษา เพื่อวัตถุประสงค์ทางการศึกษาและสถิติ
            </li>
            <li>
              <strong>Logs การใช้งาน:</strong> เก็บไว้ไม่เกิน 90 วัน เพื่อวัตถุประสงค์ด้านความปลอดภัย
            </li>
          </ul>
        </section>

        {/* Data Sharing */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            7. การเปิดเผยข้อมูลส่วนบุคคล
          </h2>
          <p className="mb-4 text-gray-700">
            เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลที่สาม ยกเว้นในกรณีดังต่อไปนี้:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>
              <strong>ภายในโรงเรียน:</strong> แบ่งปันข้อมูลกับบุคลากรที่เกี่ยวข้องเพื่อการดำเนินงานด้านการศึกษา
            </li>
            <li>
              <strong>ผู้ให้บริการเทคโนโลยี:</strong> Vercel (hosting), Prisma (database), และบริการที่จำเป็นต่อการให้บริการระบบ
            </li>
            <li>
              <strong>หน่วยงานราชการ:</strong> เมื่อมีกฎหมายหรือคำสั่งศาลกำหนดให้ต้องเปิดเผย
            </li>
            <li>
              <strong>การป้องกันความเสียหาย:</strong> เพื่อป้องกันหรือหยุดยั้งการกระทำที่ผิดกฎหมายหรือเป็นอันตรายต่อระบบ
            </li>
          </ul>
          <p className="text-gray-700">
            เราจะไม่ขายหรือเช่าข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอกเพื่อวัตถุประสงค์ทางการตลาดหรือเชิงพาณิชย์
          </p>
        </section>

        {/* User Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            8. สิทธิของเจ้าของข้อมูลส่วนบุคคล
          </h2>
          <p className="mb-4 text-gray-700">
            ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ท่านมีสิทธิดังต่อไปนี้:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>
              <strong>สิทธิในการเข้าถึงข้อมูล:</strong> ขอเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคลของท่าน
            </li>
            <li>
              <strong>สิทธิในการแก้ไขข้อมูล:</strong> ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่ครบถ้วน
            </li>
            <li>
              <strong>สิทธิในการลบข้อมูล:</strong> ขอให้ลบข้อมูลส่วนบุคคลของท่าน (ภายใต้เงื่อนไขตามกฎหมาย)
            </li>
            <li>
              <strong>สิทธิในการระงับการใช้ข้อมูล:</strong> ขอให้ระงับการใช้ข้อมูลชั่วคราว
            </li>
            <li>
              <strong>สิทธิในการคัดค้าน:</strong> คัดค้านการประมวลผลข้อมูลบางประเภท
            </li>
            <li>
              <strong>สิทธิในการโอนย้ายข้อมูล:</strong> ขอรับข้อมูลในรูปแบบที่สามารถอ่านได้ด้วยเครื่องมือทั่วไป
            </li>
            <li>
              <strong>สิทธิในการถอนความยินยอม:</strong> ถอนความยินยอมในการประมวลผลข้อมูลได้ตลอดเวลา
            </li>
            <li>
              <strong>สิทธิในการร้องเรียน:</strong> ยื่นคำร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล
            </li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-gray-800">
              <strong>วิธีการใช้สิทธิ:</strong> หากท่านต้องการใช้สิทธิใดๆ ข้างต้น กรุณาติดต่อโรงเรียนผ่านช่องทางที่ระบุในหัวข้อที่ 11
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            9. คุกกี้ (Cookies) และเทคโนโลยีติดตาม
          </h2>
          <p className="mb-4 text-gray-700">
            เราใช้คุกกี้และเทคโนโลยีที่คล้ายกันเพื่อปรับปรุงประสบการณ์การใช้งานของท่าน:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>
              <strong>คุกกี้ที่จำเป็น:</strong> เพื่อการทำงานพื้นฐานของระบบ เช่น การเข้าสู่ระบบและความปลอดภัย
            </li>
            <li>
              <strong>คุกกี้การวิเคราะห์:</strong> เพื่อวิเคราะห์การใช้งานและปรับปรุงระบบ (Vercel Analytics)
            </li>
          </ul>
          <p className="text-gray-700">
            ท่านสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ได้ แต่อาจส่งผลต่อการใช้งานบางฟังก์ชันของระบบ
          </p>
        </section>

        {/* Changes to Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            10. การเปลี่ยนแปลงนโยบายความเป็นส่วนตัว
          </h2>
          <p className="mb-4 text-gray-700">
            เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว เพื่อให้สอดคล้องกับการเปลี่ยนแปลงของระบบ กฎหมาย 
            หรือแนวปฏิบัติด้านความเป็นส่วนตัว การเปลี่ยนแปลงที่สำคัญจะถูกแจ้งให้ท่านทราบผ่านระบบหรืออีเมล
          </p>
          <p className="text-gray-700">
            เราขอแนะนำให้ท่านตรวจสอบนโยบายนี้เป็นประจำ วันที่ "ปรับปรุงล่าสุด" ที่แสดงด้านบนจะระบุเวลาที่มีการเปลี่ยนแปลงล่าสุด
          </p>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            11. การติดต่อเรา
          </h2>
          <p className="mb-4 text-gray-700">
            หากท่านมีคำถาม ข้อสงสัย หรือต้องการใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคลของท่าน กรุณาติดต่อ:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
            <p className="font-semibold text-gray-900 mb-2">
              โรงเรียนพระซองสามัคคีวิทยา
            </p>
            <p className="text-gray-700">
              สำนักงานเขตพื้นที่การศึกษามัธยมศึกษานครพนม
              <br />
              จังหวัดนครพนม
            </p>
            <p className="text-gray-700 mt-3">
              <strong>เว็บไซต์:</strong>{" "}
              <a
                href="http://www.phrasong.ac.th/mainpage"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.phrasong.ac.th
              </a>
              <br />
              <strong>Facebook:</strong>{" "}
              <a
                href="https://www.facebook.com/phrasongschool"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                facebook.com/phrasongschool
              </a>
            </p>
          </div>
          <p className="text-gray-700">
            เราจะพยายามตอบกลับคำร้องขอของท่านภายใน 30 วัน นับจากวันที่ได้รับคำร้องขอที่สมบูรณ์
          </p>
        </section>

        {/* PDPA Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            12. การร้องเรียนต่อหน่วยงานกำกับดูแล
          </h2>
          <p className="mb-4 text-gray-700">
            หากท่านเชื่อว่าเราประมวลผลข้อมูลส่วนบุคคลของท่านโดยไม่ชอบด้วยกฎหมาย 
            ท่านมีสิทธิ์ยื่นคำร้องเรียนต่อ:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
            <p className="font-semibold text-gray-900 mb-2">
              สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.)
            </p>
            <p className="text-gray-700">
              เว็บไซต์:{" "}
              <a
                href="https://www.pdpc.or.th"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.pdpc.or.th
              </a>
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 pt-6 mt-8">
          <p className="text-sm text-gray-600 mb-4">
            นโยบายนี้จัดทำขึ้นเพื่อปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 
            และกฎหมายอื่นๆ ที่เกี่ยวข้อง
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/about"
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              เกี่ยวกับโรงเรียน
            </Link>
            <Link
              href="/contact"
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              ติดต่อเรา
            </Link>
            <Link
              href="/"
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
