import { PrismaClient } from '../src/generated/prisma';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  try {
    // Mevcut verileri temizleyelim (opsiyonel)
    console.log('Cleaning existing data...');
    await prisma.chatMessage.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.poem.deleteMany({});
    await prisma.card.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Database cleaned');

    // Admin kullanıcısı oluştur
    console.log('Creating admin user...');
    const adminPassword = await hash('admin123', 10);
    console.log('Admin password hashed');

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: adminPassword,
        isAdmin: true,
      },
    });
    console.log('Admin user created:', admin.id);

    // Normal kullanıcı oluştur
    console.log('Creating normal user...');
    const userPassword = await hash('user123', 10);
    console.log('User password hashed');

    const user = await prisma.user.create({
      data: {
        username: 'user',
        password: userPassword,
        isAdmin: false,
      },
    });
    console.log('Normal user created:', user.id);

    // Örnek kartlar oluştur
    const card1 = await prisma.card.create({
      data: {
        title: 'Aşkımız',
        content: 'Birbirimizi her gün daha çok seviyoruz.',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7',
      },
    });
    console.log('Example card 1 created:', card1.id);

    const card2 = await prisma.card.create({
      data: {
        title: 'Anılarımız',
        content: 'Birlikte geçirdiğimiz güzel anılar.',
        imageUrl: 'https://images.unsplash.com/photo-1537274327090-c8cd4dbd9977',
      },
    });
    console.log('Example card 2 created:', card2.id);

    const card3 = await prisma.card.create({
      data: {
        title: 'Geleceğimiz',
        content: 'Hayallerimizi birlikte gerçekleştireceğiz.',
        imageUrl: 'https://images.unsplash.com/photo-1482235225574-c37692835cf3',
      },
    });
    console.log('Example card 3 created:', card3.id);

    // Örnek notlar oluştur
    const note1 = await prisma.note.create({
      data: {
        title: 'Alışveriş Listesi',
        content: '- Süt\n- Ekmek\n- Meyve\n- Çikolata\n- Su',
        userId: user.id,
      },
    });
    console.log('Example note 1 created:', note1.id);

    const note2 = await prisma.note.create({
      data: {
        title: 'Film Önerileri',
        content: '1. Titanik\n2. Aşk ve Gurur\n3. Notebook\n4. La La Land',
        userId: user.id,
      },
    });
    console.log('Example note 2 created:', note2.id);

    // Örnek şiirler oluştur
    const poem1 = await prisma.poem.create({
      data: {
        title: 'Seni Seviyorum',
        content: 'Her gün güneş doğduğunda,\nİlk düşüncem sensin.\nGeceleri yatağa yattığımda,\nSon düşüncem yine sensin.\nSeni seviyorum, sonsuza dek...',
        userId: user.id,
      },
    });
    console.log('Example poem 1 created:', poem1.id);

    const poem2 = await prisma.poem.create({
      data: {
        title: 'Kalbimdeki Melek',
        content: 'Gözlerin yıldız gibi parlar,\nGülüşün güneş gibi ısıtır içimi.\nSeninle geçen her an,\nBir cennet bahçesi gibidir bana.\nSen benim kalbimdesin, meleğim.',
        userId: user.id,
      },
    });
    console.log('Example poem 2 created:', poem2.id);

    // Örnek mesajlar oluştur
    const message1 = await prisma.chatMessage.create({
      data: {
        content: 'Merhaba, nasılsın?',
        senderId: admin.id,
        receiverId: user.id,
      },
    });
    console.log('Example message 1 created:', message1.id);

    const message2 = await prisma.chatMessage.create({
      data: {
        content: 'İyiyim, teşekkür ederim. Sen nasılsın?',
        senderId: user.id,
        receiverId: admin.id,
      },
    });
    console.log('Example message 2 created:', message2.id);

    const message3 = await prisma.chatMessage.create({
      data: {
        content: 'Ben de iyiyim. Bugün ne yapmak istersin?',
        senderId: admin.id,
        receiverId: user.id,
      },
    });
    console.log('Example message 3 created:', message3.id);

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
