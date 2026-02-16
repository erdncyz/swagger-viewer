# 🚀 Modern Swagger & OpenAPI Viewer

**Swagger Viewer**, API dokümantasyonlarını görüntülemek, test etmek ve hata ayıklamak için geliştirilmiş modern, hızlı ve şık bir React uygulamasıdır. Standart Swagger UI'ın hantal yapısından sıkılanlar ve CORS sorunlarıyla boğuşmak istemeyenler için tasarlanmıştır.

## ✨ Neden Bu Proje?

Geliştiriciler olarak API entegrasyonu yaparken sıkça şu sorunlarla karşılaşırız:
- ❌ **CORS Hataları**: Farklı domaindeki Swagger dosyalarını yüklerken tarayıcının engellemesi.
- ❌ **Eksik Test Araçları**: Parametreleri düzgün gönderememek veya Auth token'ın içeriğini görememek.
- ❌ **Kötü Görünüm**: Okunması zor JSON yanıtları ve karmaşık arayüzler.

**Swagger Viewer** bu sorunları çözer:
- ✅ **Universal Proxy**: Dahili proxy sunucusu sayesinde CORS sorunu yaşamadan *herhangi bir* URL'den Swagger yükleyebilirsiniz.
- ✅ **Akıllı "Try It" Paneli**: Query, Path ve Header parametrelerini otomatik tanır ve ayrı inputlar sunar.
- ✅ **Dahili JWT Decoder**: Token yapıştırdığınız anda Header ve Payload bilgisini anında çözüp gösterir.
- ✅ **Gelişmiş JSON Viewer**: Yanıtları renklendirilmiş, katlanabilir ve kopyalanabilir bir formatta sunar.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🛡️ CORS-Free Bağlantı (Universal Proxy)
Arka planda çalışan özel Node.js proxy middleware'i sayesinde, `Access-Control-Allow-Origin` izni vermeyen sunuculardaki Swagger JSON dosyalarını bile sorunsuz yüklersiniz.
- **Otomatik Algılama**: Uygulama, doğrudan erişilemeyen linkleri otomatik olarak kendi proxy'si üzerinden geçirir.
- **Güvenli**: Development ortamında SSL hatalarını (self-signed sertifikalar) görmezden gelerek internal servisleri test etmenizi sağlar.

### 2. 🔐 Entegre JWT Ayrıştırıcı (JWT Parser)
API anahtarlarınızı veya Bearer Token'larınızı girerken başka bir siteye gidip "decode" etmenize gerek yok.
- **Authorize Modalı**: Token'ı input alanına yapıştırdığınız anda aşağıda **Header** ve **Payload** içeriği otomatik olarak belirir.
- **Rol ve Süre Kontrolü**: `exp` (son kullanma tarihi), `roles` veya `sub` gibi kritik bilgileri anında kontrol edebilirsiniz.

### 3. 🚀 Gelişmiş İstek Paneli (Try It)
Standart Swagger UI'da bazen parametre göndermek işkence olabilir.
- **Ayrıştırılmış Inputlar**: `Path` (örn: `/users/{id}`) ve `Query` (örn: `?page=1`) parametreleri için ayrı ayrı, temiz input alanları oluşturulur.
- **Dinamik Base URL**: Swagger dosyasında sunucu adresi eksik olsa bile, dosyanın yüklendiği adresi baz alarak isteği doğru yere gönderir (Localhost'a düşmez).

### 4. 🎨 JSON Görüntüleyici
API yanıtlarını (Response) okumak artık daha kolay.
- **Syntax Highlighting**: String, Number, Boolean ve Null değerler farklı renklerde.
- **Collapsible**: İç içe geçmiş büyük JSON objelerini tek tıkla daraltıp genişletebilirsiniz.
- **Tek Tıkla Kopyalama**: Yanıtı panoya kopyalamak için özel buton.


### 5. 💻 Gelişmiş cURL Desteği
API isteklerini sadece arayüzden değil, terminalden de yönetmek isteyenler için tam destek sunar.
- **Otomatik cURL Oluşturma**: "Try It" panelinde yapılandırdığınız her isteğin (Header, Body dahil) tam cURL komutunu anlık olarak üretir. Tek tıkla kopyalayıp terminalde çalıştırabilirsiniz.
- **cURL Çalıştırıcı (Runner)**: Elinizdeki ham (raw) cURL komutunu yapıştırıp uygulamamız üzerinden çalıştırabilirsiniz. Postman'den veya dokümantasyondan aldığınız komutları doğrudan test edin.

### 6. 🌍 Çoklu Dil Desteği (TR / EN)
Proje artık tamamen Türkçe ve İngilizce dil desteğine sahip. Sağ üstteki buton ile dilediğiniz zaman dil değiştirebilirsiniz.

---

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

1.  **Depoyu Klonlayın**:
    ```bash
    git clone https://github.com/your-username/swagger-viewer.git
    cd swagger-viewer
    ```

2.  **Bağımlılıkları Yükleyin**:
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın**:
    ```bash
    npm run dev
    ```

4.  Tarayıcınızda `http://localhost:5173` adresine gidin.

---

## 📖 Kullanım Senaryoları

### Senaryo 1: Internal API Testi
Şirket içindeki VPN arkasındaki bir servisin Swagger dokümantasyonuna bakmanız gerekiyor ama tarayıcı CORS hatası veriyor.
- **Çözüm**: Swagger URL'ini yapıştırın ve "Yükle"ye basın. Proxy devreye girer ve dokümantasyonu önünüze getirir.

### Senaryo 2: Token Debugging
"Yetki yok" (401/403) hatası alıyorsunuz. Token'ınızın süresi mi doldu yoksa yanlış rol mü var?
- **Çözüm**: Sağ üstteki **Authorize** butonuna tıklayın. Token'ınızı yapıştırın. Altta açılan panelden `exp` tarihini ve `scope` değerlerini anında doğrulayın.

### Senaryo 3: Karmaşık Veri Analizi
Bir endpoint size 5000 satırlık karmaşık bir JSON dönüyor.
- **Çözüm**: "Try It" ile isteği atın. Gelen yanıtta ilgilenmediğiniz array'leri daraltın (collapse) ve sadece odaklanmanız gereken veriyi inceleyin.


### Senaryo 4: Hızlı Prototipleme (cURL Runner)
Elinizde çalışıp çalışmadığını bilmediğiniz bir cURL komutu var. Terminal açmak yerine hızlıca yanıtı görmek istiyorsunuz.
- **Çözüm**: "Run cURL" butonuna basın, komutu yapıştırın ve yanıtı anında JSON olarak formatlanmış şekilde görün.

---

## 🏗️ Teknoloji Yığını

- **React 19**: En güncel React özellikleri ve performansı.
- **Vite**: Ultra hızlı geliştirme sunucusu ve build aracı.
- **CSS Variables**: Modern ve dinamik tema yönetimi.
- **Özel Proxy**: Node.js tabanlı, `http-proxy` mantığıyla çalışan hafif middleware.

---

Bu proje, açık kaynak dünyasındaki geliştiricilerin API süreçlerini hızlandırmak için ❤️ ile geliştirildi.
