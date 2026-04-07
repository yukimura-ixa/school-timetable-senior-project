import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Globe, Facebook, MapPin, Phone } from "lucide-react";
import { createMetadataWithCanonical } from "@/utils/canonical-url";

export const metadata: Metadata = createMetadataWithCanonical({
  title: "ติดต่อเรา - โรงเรียนพระซองสามัคคีวิทยา",
  description:
    "ติดต่อโรงเรียนพระซองสามัคคีวิทยา จังหวัดนครพนม - ช่องทางการติดต่อ ที่อยู่ เว็บไซต์ และโซเชียลมีเดีย",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">ติดต่อเรา</h1>

      <div className="prose prose-slate max-w-none">
        <p className="text-gray-700 leading-relaxed mb-8">
          หากท่านมีคำถาม ข้อสงสัย หรือต้องการข้อมูลเพิ่มเติมเกี่ยวกับโรงเรียนพระซองสามัคคีวิทยา
          หรือระบบตารางเรียนตารางสอนออนไลน์ กรุณาติดต่อเราผ่านช่องทางด้านล่างนี้
        </p>

        {/* School Information */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              โรงเรียนพระซองสามัคคีวิทยา
            </h2>
            <p className="text-sm text-gray-600 mb-4 italic">
              Phrasong Sammakkee Wittaya School
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">ที่อยู่:</p>
                  <p className="text-gray-700">
                    สำนักงานเขตพื้นที่การศึกษามัธยมศึกษานครพนม
                    <br />
                    จังหวัดนครพนม
                    <br />
                    ประเทศไทย
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    โทรศัพท์:
                  </p>
                  <p className="text-gray-600 text-sm">
                    กรุณาดูข้อมูลการติดต่อได้ที่เว็บไซต์โรงเรียน
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Channels */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            ช่องทางการติดต่อ
          </h2>

          <div className="grid md:grid-cols-1 gap-4 mb-6">
            {/* Website */}
            <a
              href="http://www.phrasong.ac.th/mainpage"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg rounded-lg p-5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900 mb-1">
                    เว็บไซต์โรงเรียน
                  </p>
                  <p className="text-blue-600 text-sm break-all">
                    www.phrasong.ac.th/mainpage
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    ข้อมูลข่าวสาร กิจกรรม และการติดต่อโรงเรียน
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/phrasongschool"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg rounded-lg p-5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                  <Facebook className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900 mb-1">
                    Facebook โรงเรียนพระซองสามัคคีวิทยา
                  </p>
                  <p className="text-blue-600 text-sm">
                    facebook.com/phrasongschool
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    ติดตามข่าวสาร กิจกรรม และภาพบรรยากาศของโรงเรียน
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg">
            <p className="text-gray-700">
              <strong>หมายเหตุ:</strong>{" "}
              สำหรับคำถามเฉพาะเกี่ยวกับระบบตารางเรียนตารางสอนออนไลน์
              กรุณาติดต่อผ่านเว็บไซต์โรงเรียนหรือช่องทาง Facebook ข้างต้น
            </p>
          </div>
        </section>

        {/* Technical Support */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            การสนับสนุนทางเทคนิค
          </h2>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <p className="font-semibold text-indigo-900 mb-3">
              💻 ระบบตารางเรียนตารางสอนออนไลน์
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              หากท่านพบปัญหาในการใช้งานระบบตารางเรียนตารางสอน เช่น:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>ไม่สามารถเข้าสู่ระบบได้</li>
              <li>ไม่พบข้อมูลตารางเรียนหรือตารางสอน</li>
              <li>ข้อมูลไม่ถูกต้อง</li>
              <li>ปัญหาด้านเทคนิคอื่นๆ</li>
            </ul>
            <p className="text-gray-700">
              กรุณาติดต่อฝ่ายเทคโนโลยีของโรงเรียนผ่านช่องทางข้างต้น
              พร้อมระบุรายละเอียดปัญหาและหมายเลขผู้ใช้ของท่าน
              (ถ้ามี) เพื่อให้เราสามารถช่วยเหลือท่านได้อย่างรวดเร็ว
            </p>
          </div>
        </section>

        {/* Privacy & Data */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            ข้อมูลส่วนบุคคลและความเป็นส่วนตัว
          </h2>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed mb-3">
              หากท่านมีคำถามหรือต้องการใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคลของท่าน
              ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
              เช่น:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>ขอเข้าถึงข้อมูลส่วนบุคคลของท่าน</li>
              <li>ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
              <li>ขอลบข้อมูลส่วนบุคคล</li>
              <li>ถอนความยินยอมในการประมวลผลข้อมูล</li>
            </ul>
            <p className="text-gray-700">
              กรุณาติดต่อโรงเรียนผ่านช่องทางที่ระบุข้างต้น
              พร้อมแนบเอกสารยืนยันตัวตนเพื่อความปลอดภัยของข้อมูลของท่าน
            </p>
            <div className="mt-4 pt-4 border-t border-green-300">
              <Link
                href="/privacy-policy"
                className="text-green-700 hover:text-green-900 font-semibold hover:underline"
              >
                อ่านนโยบายความเป็นส่วนตัวฉบับเต็ม →
              </Link>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            เวลาทำการ
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-2">
              <strong>วันจันทร์ - วันศุกร์:</strong> 08:00 - 16:30 น.
            </p>
            <p className="text-gray-700 mb-2">
              <strong>วันเสาร์ - วันอาทิตย์:</strong> ปิดทำการ
            </p>
            <p className="text-gray-600 text-sm mt-3">
              * ยกเว้นวันหยุดนักขัตฤกษ์ และวันหยุดพิเศษตามประกาศของโรงเรียน
            </p>
          </div>
        </section>

        {/* Response Time */}
        <section className="mb-10">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
            <p className="text-gray-700">
              <strong>⏱️ ระยะเวลาตอบกลับ:</strong>{" "}
              โรงเรียนจะพยายามตอบกลับคำถามและข้อสงสัยของท่านภายใน{" "}
              <strong>3-5 วันทำการ</strong>{" "}
              สำหรับการใช้สิทธิตาม PDPA จะได้รับการตอบกลับภายใน{" "}
              <strong>30 วัน</strong> ตามที่กฎหมายกำหนด
            </p>
          </div>
        </section>

        {/* Footer Links */}
        <div className="border-t-2 border-gray-200 pt-6 mt-8">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/"
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/about"
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              เกี่ยวกับโรงเรียน
            </Link>
            <Link
              href="/privacy-policy"
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
