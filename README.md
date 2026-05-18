# Smart City Navigator

Kullanıcı tercihlerine göre optimize edilmiş şehir içi rota planlama uygulaması.

## Proje Yapısı

| Klasör | Açıklama | Teknoloji |
|--------|----------|-----------|
| `prototip-1/` | İlk web prototipi | HTML, CSS, JavaScript |
| `prototip-2/` | Mobil uygulama prototipi | React Native, Expo, TypeScript |

## Prototip 1 — Web Arayüzü

Projenin ilk aşamasında saf HTML/CSS/JS ile hazırlanmış web tabanlı prototip.
Tarayıcıda doğrudan açılabilir.

## Prototip 2 — Mobil Uygulama

React Native ve Expo kullanılarak geliştirilen mobil uygulama prototipi.

### Kurulum

```bash
cd prototip-2
npm install
npx expo start
```

## 🔌 Kullanılan API'ler ve Veri Kaynakları

Projede veri çeşitliliğini artırmak ve kullanıcıya zengin bir rota planı sunabilmek için 3 farklı dinamik veri kaynağı entegre edilmiştir:

1. **Google Places API:**
   * **Kullanım Amacı:** Konum tabanlı mekan aramaları, kafe, restoran ve popüler turistik yerlerin temel bilgilerini (isim, adres, puanlama vb.) çekmek için kullanılır.

2. **Etkinlik.io API:**
   * **Kullanım Amacı:** Şehirdeki güncel kültür-sanat etkinliklerini, tiyatroları, stand-up gösterilerini ve resmi organizasyonları canlı veri akışı olarak uygulamaya dahil etmek için kullanılır.

3. **Overpass API (OpenStreetMap):**
   * **Kullanım Amacı:** Açık kaynaklı harita verilerini kullanarak gastronomik, tarihi ve doğa rotaları için çevredeki koordinat (node/way) ve niş mekan bilgilerini çekmek amacıyla entegre edilmiştir.

## Ekip

- [Sygemre](https://github.com/Sygemre)
- [sudekhrmn](https://github.com/sudekhrmn)
- [berfinkkarakoc](https://github.com/berfinkkarakoc)
- [smelikeaslan](https://github.com/smelikeaslan)
- [cansuaykbsn](https://github.com/cansuaykbsn)
