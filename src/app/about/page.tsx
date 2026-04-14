import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, School, Users, Calendar } from "lucide-react";
import { createMetadataWithSocial } from "@/utils/canonical-url";

export const metadata: Metadata = createMetadataWithSocial({
  title: "เกี่ยวกับโรงเรียน - โรงเรียนพระซองสามัคคีวิทยา",
  description:
    "โรงเรียนพระซองสามัคคีวิทยา จังหวัดนครพนม สถาบันการศึกษาที่อนุรักษ์วัฒนธรรมไทกะเลิง ระบำหมากเบ็ง พัฒนาผู้เรียนตามมาตรฐาน PISA พร้อมระบบตารางเรียนตารางสอนออนไลน์ที่ทันสมัย",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        เกี่ยวกับโรงเรียนพระซองสามัคคีวิทยา
      </h1>

      <div className="prose prose-slate max-w-none">
        {/* School Introduction */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <School className="w-6 h-6 text-blue-600" />
              ข้อมูลโรงเรียน
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                <strong>ชื่อเต็ม:</strong> โรงเรียนพระซองสามัคคีวิทยา
                (Phrasong Sammakkee Wittaya School)
              </p>
              <p>
                <strong>สังกัด:</strong>{" "}
                สำนักงานเขตพื้นที่การศึกษามัธยมศึกษานครพนม
              </p>
              <p>
                <strong>จังหวัด:</strong> นครพนม
              </p>
              <p>
                <strong>ระดับการศึกษา:</strong> มัธยมศึกษาตอนต้น - ตอนปลาย
                (ม.1 - ม.6)
              </p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mb-4">
            โรงเรียนพระซองสามัคคีวิทยาเป็นสถาบันการศึกษาของรัฐในสังกัดสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน
            (สพฐ.) ตั้งอยู่ในพื้นที่จังหวัดนครพนม
            ภาคตะวันออกเฉียงเหนือของประเทศไทย
          </p>
          <p className="text-gray-700 leading-relaxed">
            โรงเรียนมุ่งเน้นการพัฒนาผู้เรียนให้เป็นคนดี มีความรู้
            และมีจิตสำนึกในการอนุรักษ์วัฒนธรรมท้องถิ่น
            โดยเฉพาะอย่างยิ่งวัฒนธรรมไทกะเลิงที่เป็นเอกลักษณ์ของพื้นที่
          </p>
        </section>

        {/* Philosophy & Motto */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            ปรัชญาและคติพจน์
          </h2>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg mb-4">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              ปรัชญา (Philosophy):
            </p>
            <p className="text-gray-700 italic text-xl mb-2">
              "นตฺถิ ปญฺญาสมา อาภา"
            </p>
            <p className="text-gray-600">
              แปลว่า: "ไม่มีแสงสว่างใดเสมอด้วยแสงสว่างแห่งปัญญา"
            </p>
            <p className="text-gray-600 mt-2">
              ความหมาย:
              ปัญญาเป็นแสงสว่างที่นำทางชีวิตให้ประสบความสำเร็จและความสุขที่แท้จริง
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              สีประจำโรงเรียน (School Colors):
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded border border-gray-300"></div>
                <span className="text-gray-700">เขียว (Green)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded border border-gray-300"></div>
                <span className="text-gray-700">เหลือง (Yellow)</span>
              </div>
            </div>
            <p className="text-gray-600 mt-3">
              สีเขียวและเหลืองสื่อถึงความเจริญงอกงาม ความสดใส
              และความมุ่งมั่นในการพัฒนาผู้เรียน
            </p>
          </div>
        </section>

        {/* Cultural Identity */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            เอกลักษณ์ทางวัฒนธรรม
          </h2>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-4">
            <h3 className="text-xl font-semibold text-purple-900 mb-3">
              วัฒนธรรมไทกะเลิง (Tai Kaleng Culture)
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              โรงเรียนพระซองสามัคคีวิทยามีบทบาทสำคัญในการอนุรักษ์และสืบทอดวัฒนธรรมไทกะเลิง
              ซึ่งเป็นกลุ่มชาติพันธุ์ที่มีเอกลักษณ์โดดเด่นในพื้นที่นครพนม
              โรงเรียนส่งเสริมให้นักเรียนเรียนรู้และภาคภูมิใจในรากเหง้าทางวัฒนธรรมของตนเอง
            </p>

            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-2">
                🎭 ระบำหมากเบ็ง (Maak-Beng Dance):
              </p>
              <p className="text-gray-700">
                การแสดงพื้นบ้านแบบดั้งเดิมของชาวไทกะเลิง
                ที่นักเรียนได้เรียนรู้และสืบทอดต่อไป
                เป็นส่วนหนึ่งของการศึกษาทางศิลปะและวัฒนธรรม
              </p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">
            นอกจากนี้
            โรงเรียนยังมุ่งเน้นการพัฒนาตามมาตรฐาน PISA
            (Programme for International Student Assessment)
            เพื่อยกระดับคุณภาพการศึกษาให้สอดคล้องกับมาตรฐานสากล
          </p>
        </section>

        {/* Timetable System */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            เกี่ยวกับระบบตารางเรียนตารางสอนออนไลน์
          </h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            ระบบตารางเรียนตารางสอนออนไลน์ของโรงเรียนพระซองสามัคคีวิทยาพัฒนาขึ้นเพื่อเพิ่มประสิทธิภาพในการบริหารจัดการตารางเรียนและตารางสอน
            ช่วยให้ครู นักเรียน และผู้ปกครองสามารถเข้าถึงข้อมูลได้สะดวก
            รวดเร็ว และแม่นยำ
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="font-semibold text-blue-900 mb-2">
                ✨ คุณสมบัติหลัก
              </h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• ดูตารางเรียนตารางสอนแบบเรียลไทม์</li>
                <li>• ค้นหาครูและชั้นเรียน</li>
                <li>• จัดการตารางตามหลักสูตร MOE</li>
                <li>• ตรวจสอบความขัดแย้งอัตโนมัติ</li>
                <li>• รองรับหลายเทอม/ปีการศึกษา</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h3 className="font-semibold text-green-900 mb-2">
                👥 ผู้ใช้งาน
              </h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>
                  • <strong>ครู:</strong>{" "}
                  ดูตารางสอนและรายละเอียดชั้นเรียน
                </li>
                <li>
                  • <strong>นักเรียน:</strong> ดูตารางเรียนประจำวัน
                </li>
                <li>
                  • <strong>ผู้ดูแล:</strong>{" "}
                  จัดการและอัพเดตตารางทั้งหมด
                </li>
                <li>
                  • <strong>บุคคลทั่วไป:</strong>{" "}
                  ค้นหาข้อมูลครูและตารางสอน
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-lg">
            <p className="text-gray-700">
              <strong>เทคโนโลยี:</strong> ระบบพัฒนาด้วย Next.js 16,
              TypeScript, Prisma, และ Vercel Postgres
              เพื่อความเสถียรและความปลอดภัยสูงสุด
              ตามมาตรฐานการคุ้มครองข้อมูลส่วนบุคคล (PDPA)
            </p>
          </div>
        </section>

        {/* Vision */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            วิสัยทัศน์ (Vision)
          </h2>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-lg p-6">
            <p className="text-gray-800 leading-relaxed text-center font-medium">
              "มุ่งพัฒนาผู้เรียนให้เป็นบุคคลที่มีคุณภาพ มีความรู้คู่คุณธรรม
              <br />
              สืบสานวัฒนธรรมท้องถิ่น
              และก้าวทันการเปลี่ยนแปลงของโลกในศตวรรษที่ 21"
            </p>
          </div>
        </section>

        {/* Contact Links */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            ช่องทางการติดต่อ
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="http://www.phrasong.ac.th/mainpage"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-5 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <School className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    เว็บไซต์โรงเรียน
                  </p>
                  <p className="text-sm text-blue-600">
                    www.phrasong.ac.th
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                ข้อมูล ข่าวสาร และกิจกรรมของโรงเรียน
              </p>
            </a>

            <a
              href="https://www.facebook.com/phrasongschool"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-5 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Facebook โรงเรียน
                  </p>
                  <p className="text-sm text-blue-600">
                    @phrasongschool
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                ติดตามข่าวสารและกิจกรรมล่าสุด
              </p>
            </a>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              ดูข้อมูลการติดต่อเพิ่มเติม →
            </Link>
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
              href="/privacy-policy"
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link
              href="/contact"
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
