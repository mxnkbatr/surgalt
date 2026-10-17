export type Lesson = {
  id: string
  title: string
  duration: string
  free?: boolean
  /**
   * Видео холбоос — 3 аргаас аль нэгийг ашиглана:
   * 1) YouTube: https://www.youtube.com/watch?v=XXXX  эсвэл https://youtu.be/XXXX
   * 2) Vimeo:   https://vimeo.com/123456789
   * 3) Файл:    /videos/intro.mp4  (public/videos/ дотор байрлуулна)
   *             эсвэл https://cdn.example.com/lesson.mp4
   */
  videoUrl?: string
}

export type CourseCategory = 'Санхүү' | 'Дизайн' | 'Контент'

export type Course = {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  learnings: string[]
  instructor: string
  instructorRole: string
  lessons: Lesson[]
  price: number
  originalPrice: number
  students: number
  rating: number
  accent: string
  accentSoft: string
  coverLabel: string
  tag: string
  category: CourseCategory
}

export const courses: Course[] = [
  {
    id: '1',
    slug: 'mongonii-nuuts',
    title: 'Мөнгөний нууц: хэн ч заадаггүй 12 хичээл',
    subtitle: 'Өдөр тутмын мөнгөө ойлгох нь',
    description:
      'Цалин, зардал, зээл, хуримтлалын тухай өдөр тутмын жишээгээр ойлгож, өөрийн мөнгөндөө илүү тодорхой төлөвлөгөө гаргаарай.',
    learnings: [
      'Жижиг зардлын нийлбэрийг тооцох',
      'Хямдрал болон зээлийн бодит өртгийг анзаарах',
      'Гэр бүлийн нөөцөө төлөвлөх',
      'Санхүүгийн залилангийн шинжийг таних',
    ],
    instructor: 'Б. Энхтуяа',
    instructorRole: 'Санхүүгийн сургагч',
    price: 29900,
    originalPrice: 150000,
    students: 2840,
    rating: 4.9,
    accent: '#1F6B4A',
    accentSoft: '#D8F3E5',
    coverLabel: 'МӨНГӨНИЙ\nНУУЦ',
    tag: 'Хамгийн эрэлттэй',
    category: 'Санхүү',
    lessons: [
      {
        id: 'intro',
        title: 'Танилцуулга',
        duration: '3:20',
        free: true,
        // Жишээ: өөрийн YouTube холбоосоор солиорой
        videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      },
      {
        id: '1',
        title: 'Цалин нэмэгдсэн ч мөнгө яагаад хүрэхгүй байна вэ?',
        duration: '8:14',
        // Жишээ MP4: файлээ public/videos/ дотор тавиад ингэж холбоно
        // videoUrl: '/videos/mongonii-1.mp4',
        videoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      },
      {
        id: '2',
        title: 'Өдөрт таван мянган төгрөг арван жилд хэд болдог вэ?',
        duration: '7:42',
      },
      {
        id: '3',
        title: 'Дэлгүүр таны тархийг хэрхэн хуурдаг вэ: хямдралын таван заль',
        duration: '9:05',
      },
      {
        id: '4',
        title:
          'Сарын гурван хувийн хүү яагаад жилдээ гучин зургаа биш, дөчин хоёр хувь вэ?',
        duration: '6:58',
      },
      {
        id: '5',
        title: 'Өр хэдэн жилд хоёр дахин өсөхийг таван секундэд тооцох далан хоёрын дүрэм',
        duration: '5:40',
      },
      {
        id: '6',
        title: 'Хүүгүй хуваан төлөлтийн нуугдмал үнэ',
        duration: '7:11',
      },
      {
        id: '7',
        title: 'Хамгийн жижиг зээлээ эхэлж хаа: сэтгэл зүйн гайхамшигт арга',
        duration: '8:33',
      },
      {
        id: '8',
        title: 'Батлан даагч болно гэдэг өөрөө зээл авахтай адил',
        duration: '6:20',
      },
      {
        id: '9',
        title: 'Хүүхдүүддээ туслахаас өмнө: онгоцны хүчилтөрөгчийн маскны дүрэм',
        duration: '7:55',
      },
      {
        id: '10',
        title: 'Цагаан сар гэнэт ирдэггүй: жил бүр ирдэг долоон зардлын нууц сан',
        duration: '8:08',
      },
      {
        id: '11',
        title: 'Дэрэн доорх мөнгөний үл үзэгдэх хулгайч',
        duration: '5:49',
      },
      {
        id: '12',
        title: 'Хүүхдийнхээ дуу хоолойгоор залгах залилан: хуримтлалаа хамгаал',
        duration: '9:12',
      },
      {
        id: 'end',
        title: 'Төгсгөл: баярлалаа, дараагийн шат',
        duration: '2:30',
      },
    ],
  },
  {
    id: '2',
    slug: 'figma-hurdan',
    title: 'Figma-г 7 хоногт эзэмших',
    subtitle: 'Дизайн системээс прототип хүртэл',
    description:
      'Мобайл апп, вэб UI-г Figma дээр цэвэрхэн, хурдан хийх арга барилыг практик төслөөр сурна.',
    learnings: [
      'Auto Layout, Components, Variants',
      'iOS-ийн зай, типографийн дүрэм',
      'Clickable прототип бүтээх',
      'Developer-т өгөх гарын авлага',
    ],
    instructor: 'Т. Номин',
    instructorRole: 'Product designer',
    price: 49900,
    originalPrice: 129000,
    students: 1120,
    rating: 4.8,
    accent: '#2B5C8A',
    accentSoft: '#D9EAF8',
    coverLabel: 'FIGMA\n7 ХОНОГ',
    tag: 'Шинэ',
    category: 'Дизайн',
    lessons: [
      {
        id: 'intro',
        title: 'Танилцуулга ба суулгалт',
        duration: '4:10',
        free: true,
        videoUrl: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8',
      },
      { id: '1', title: 'Фрейм, зай, grid-ийн үндэс', duration: '11:20' },
      { id: '2', title: 'Типографи: Onest шиг цэвэр текст', duration: '9:45' },
      { id: '3', title: 'Component болон Variant', duration: '13:02' },
      { id: '4', title: 'Мобайл дэлгэцийн урсгал', duration: '12:18' },
      { id: '5', title: 'Прототип ба presentation', duration: '10:40' },
    ],
  },
  {
    id: '3',
    slug: 'content-creator',
    title: 'Контент бүтээгчийн эхлэл',
    subtitle: 'Reels, caption, брэндинг',
    description:
      'Утаснаасаа л контент хийж, үзэгчээ өсгөх бодит аргачлал. Камер биш — тодорхой мессеж чухал.',
    learnings: [
      'Hook бичих 5 загвар',
      'Гэрэл, звук, framing',
      'Долоо хоногийн контент календарь',
      'Эхний 1000 дагагч руу хүрэх зам',
    ],
    instructor: 'М. Ариунзаяа',
    instructorRole: 'Creator coach',
    price: 39900,
    originalPrice: 99000,
    students: 3560,
    rating: 4.7,
    accent: '#8A4B2B',
    accentSoft: '#F8E6D9',
    coverLabel: 'CONTENT\nSTART',
    tag: 'Эрэлттэй',
    category: 'Контент',
    lessons: [
      {
        id: 'intro',
        title: 'Танилцуулга',
        duration: '3:05',
        free: true,
        videoUrl: 'https://www.youtube.com/watch?v=3vDwG5H7b0E',
      },
      { id: '1', title: 'Niche-ээ олох', duration: '8:22' },
      { id: '2', title: 'Hook: эхний 3 секунд', duration: '7:50' },
      { id: '3', title: 'Утасны кино зураг', duration: '10:15' },
      { id: '4', title: 'Caption болон CTA', duration: '6:40' },
      { id: '5', title: '7 хоногийн систем', duration: '9:28' },
    ],
  },
]

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug)
}

export function formatPrice(n: number): string {
  return n.toLocaleString('mn-MN') + '₮'
}
