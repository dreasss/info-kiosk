"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Users, Award, Globe, MapPin } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { TouchButton } from "@/components/ui/touch-button"

export default function AboutPage() {
  const { language, t } = useLanguage()

  const achievements = [
    {
      year: "1956",
      titleRu: "Основание ОИЯИ",
      titleEn: "JINR Foundation",
      descriptionRu: "Создание международной организации для исследований в области ядерной физики",
      descriptionEn: "Creation of international organization for nuclear physics research",
    },
    {
      year: "1960",
      titleRu: "Первый синхрофазотрон",
      titleEn: "First Synchrophasotron",
      descriptionRu: "Запуск самого мощного ускорителя того времени",
      descriptionEn: "Launch of the most powerful accelerator of that time",
    },
    {
      year: "1999",
      titleRu: "Открытие 114 элемента",
      titleEn: "Discovery of Element 114",
      descriptionRu: "Синтез сверхтяжелого элемента флеровия",
      descriptionEn: "Synthesis of superheavy element flerovium",
    },
    {
      year: "2010",
      titleRu: "Открытие 118 элемента",
      titleEn: "Discovery of Element 118",
      descriptionRu: "Синтез самого тяжелого элемента оганесона",
      descriptionEn: "Synthesis of the heaviest element oganesson",
    },
  ]

  const statistics = [
    {
      number: "18",
      labelRu: "стран-участниц",
      labelEn: "member countries",
      icon: Globe,
    },
    {
      number: "5000+",
      labelRu: "сотрудников",
      labelEn: "employees",
      icon: Users,
    },
    {
      number: "7",
      labelRu: "лабораторий",
      labelEn: "laboratories",
      icon: Building2,
    },
    {
      number: "100+",
      labelRu: "наград и премий",
      labelEn: "awards and prizes",
      icon: Award,
    },
  ]

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TouchButton asChild variant="outline" touchSize="sm">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {t.home}
                </Link>
              </TouchButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{language === "ru" ? "О ОИЯИ" : "About JINR"}</h1>
                <p className="text-sm text-gray-600">
                  {language === "ru" ? "История и достижения института" : "History and achievements of the institute"}
                </p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="h-[calc(100vh-80px)] overflow-y-auto">
        <main className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {language === "ru"
                ? "Объединенный институт ядерных исследований"
                : "Joint Institute for Nuclear Research"}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              {language === "ru"
                ? "ОИЯИ — международная межправительственная научно-исследовательская организация, созданная в 1956 году для проведения фундаментальных исследований в области ядерной физики, физики элементарных частиц и смежных областях науки."
                : "JINR is an international intergovernmental scientific research organization established in 1956 to conduct fundamental research in nuclear physics, elementary particle physics and related fields of science."}
            </p>
          </section>

          {/* Statistics */}
          <section className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statistics.map((stat, index) => (
                <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-sm text-gray-600">{language === "ru" ? stat.labelRu : stat.labelEn}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Mission and Vision */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Award className="h-6 w-6 mr-3 text-blue-600" />
                    {language === "ru" ? "Наша миссия" : "Our Mission"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {language === "ru"
                      ? "Проведение фундаментальных исследований в области ядерной физики, физики элементарных частиц, конденсированных сред и других смежных областях науки. Подготовка научных кадров высшей квалификации и развитие международного научного сотрудничества."
                      : "Conducting fundamental research in nuclear physics, elementary particle physics, condensed matter physics and other related fields of science. Training highly qualified scientific personnel and developing international scientific cooperation."}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Globe className="h-6 w-6 mr-3 text-green-600" />
                    {language === "ru" ? "Международное сотрудничество" : "International Cooperation"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {language === "ru"
                      ? "ОИЯИ объединяет ученых из 18 стран мира. Институт активно сотрудничает с ведущими научными центрами и университетами, участвует в крупных международных проектах, таких как ЦЕРН, и принимает тысячи исследователей ежегодно."
                      : "JINR brings together scientists from 18 countries around the world. The institute actively cooperates with leading scientific centers and universities, participates in major international projects such as CERN, and hosts thousands of researchers annually."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Research Areas */}
          <section className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {language === "ru" ? "Основные направления исследований" : "Main Research Areas"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  titleRu: "Ядерная физика",
                  titleEn: "Nuclear Physics",
                  descriptionRu: "Исследование структуры атомных ядер и ядерных реакций",
                  descriptionEn: "Study of atomic nuclei structure and nuclear reactions",
                },
                {
                  titleRu: "Физика элементарных частиц",
                  titleEn: "Elementary Particle Physics",
                  descriptionRu: "Изучение фундаментальных частиц и их взаимодействий",
                  descriptionEn: "Study of fundamental particles and their interactions",
                },
                {
                  titleRu: "Физика конденсированных сред",
                  titleEn: "Condensed Matter Physics",
                  descriptionRu: "Исследование свойств твердых тел и жидкостей",
                  descriptionEn: "Research of solid and liquid matter properties",
                },
                {
                  titleRu: "Теоретическая физика",
                  titleEn: "Theoretical Physics",
                  descriptionRu: "Развитие теоретических моделей и методов",
                  descriptionEn: "Development of theoretical models and methods",
                },
                {
                  titleRu: "Информационные технологии",
                  titleEn: "Information Technologies",
                  descriptionRu: "Разработка вычислительных методов и программного обеспечения",
                  descriptionEn: "Development of computational methods and software",
                },
                {
                  titleRu: "Радиобиология",
                  titleEn: "Radiobiology",
                  descriptionRu: "Изучение воздействия радиации на живые организмы",
                  descriptionEn: "Study of radiation effects on living organisms",
                },
              ].map((area, index) => (
                <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{language === "ru" ? area.titleRu : area.titleEn}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      {language === "ru" ? area.descriptionRu : area.descriptionEn}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {language === "ru" ? "Ключевые достижения" : "Key Achievements"}
            </h3>
            <div className="space-y-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {achievement.year}
                        </Badge>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {language === "ru" ? achievement.titleRu : achievement.titleEn}
                        </h4>
                        <p className="text-gray-600">
                          {language === "ru" ? achievement.descriptionRu : achievement.descriptionEn}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Location */}
          <section className="mb-12">
            <Card className="border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <MapPin className="h-6 w-6 mr-3 text-red-600" />
                  {language === "ru" ? "Расположение" : "Location"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{language === "ru" ? "Адрес" : "Address"}</h4>
                    <p className="text-gray-600 mb-4">
                      {language === "ru"
                        ? "ул. Жолио-Кюри, 6, г. Дубна, Московская область, 141980, Россия"
                        : "Joliot-Curie St., 6, Dubna, Moscow Region, 141980, Russia"}
                    </p>
                    <h4 className="font-semibold text-gray-900 mb-2">{language === "ru" ? "Контакты" : "Contacts"}</h4>
                    <p className="text-gray-600">
                      {language === "ru" ? "Телефон: +7 (49621) 6-40-40" : "Phone: +7 (49621) 6-40-40"}
                      <br />
                      Email: jinr@jinr.ru
                      <br />
                      Web: www.jinr.ru
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-6 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">
                        {language === "ru" ? "Дубна, Россия" : "Dubna, Russia"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === "ru" ? "120 км от Москвы" : "120 km from Moscow"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
