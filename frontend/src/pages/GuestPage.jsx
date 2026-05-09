import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next"; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

import slide1 from "../images/photo-1.jpeg";
import slide2 from "../images/photo-2.jpeg";
import slide3 from "../images/photo-3.jpeg";

const allImages = [slide1, slide2, slide3];

export default function GuestPage() {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ

  // Местим масива вътре, за да можем да ползваме преводача t()
  const slideTexts = [
    {
      title: t('guestPage.slide1.title', "OSINT Анализ за Подбор на Персонал"),
      description: t('guestPage.slide1.description', "Профилирайте ИТ кандидати чрез публични дигитални следи и AI анализ, за да вземате информирани HR решения.")
    },
    {
      title: t('guestPage.slide2.title', "Дълбочинен GitHub Анализ"),
      description: t('guestPage.slide2.description', "Търсете разработчици по име. Анализирайте техните хранилища, активност и реален технологичен стек за секунди.")
    },
    {
      title: t('guestPage.slide3.title', "Корпоративно Разузнаване и Headhunting"),
      description: t('guestPage.slide3.description', "Проучвайте конкурентни компании по домейн. Разкривайте организационната им структура и откривайте ключови специалисти.")
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideTexts.length);
    }, 8000);
  };

  const resetAutoSlide = () => {
    clearInterval(intervalRef.current);
    startAutoSlide();
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideTexts.length);
    resetAutoSlide();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideTexts.length) % slideTexts.length);
    resetAutoSlide();
  };

  return (
    <div className="relative w-full h-[calc(100vh-70px)] overflow-hidden bg-slate-900">
      {slideTexts.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          style={{ 
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9)), url(${allImages[index]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-6 drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl drop-shadow-md">
              {slide.description}
            </p>
          </div>
        </div>
      ))}
      
      {/* Навигационни бутони */}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-slate-800/50 hover:bg-blue-600 text-white p-4 rounded-full transition-all text-2xl backdrop-blur-sm">
        &#10094;
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-slate-800/50 hover:bg-blue-600 text-white p-4 rounded-full transition-all text-2xl backdrop-blur-sm">
        &#10095;
      </button>
    </div>
  );
}