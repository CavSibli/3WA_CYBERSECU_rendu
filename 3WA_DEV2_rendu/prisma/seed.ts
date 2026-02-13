import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateSalt, hashPassword } from "../src/utility/index";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log("🌱 Seeding database...");

  // Créer des catégories
  const categories = [
    { name: "Musique", description: "Concerts, festivals, spectacles musicaux" },
    { name: "Sport", description: "Événements sportifs, compétitions, tournois" },
    { name: "Tech", description: "Conférences, meetups, hackathons tech" },
    { name: "Art", description: "Expositions, vernissages, performances artistiques" },
    { name: "Gastronomie", description: "Dégustations, festivals culinaires" },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    createdCategories.push(created);
    console.log(`✅ Catégorie créée: ${category.name}`);
  }

  // Créer des utilisateurs (organisateurs)
  const users = [
    {
      email: "organizer1@eventhub.com",
      name: "Jean Dupont",
      role: "organizer",
      password: "password123",
    },
    {
      email: "organizer2@eventhub.com",
      name: "Marie Martin",
      role: "organizer",
      password: "password123",
    },
    {
      email: "admin@eventhub.com",
      name: "Admin EventHub",
      role: "admin",
      password: "admin123",
    },
  ];

  const createdUsers = [];
  for (const user of users) {
    const salt = await generateSalt();
    const hashedPassword = await hashPassword(user.password, salt);

    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        password: hashedPassword,
        salt,
      },
    });
    createdUsers.push(created);
    console.log(`✅ Utilisateur créé: ${user.name}`);
  }

  // Créer des lieux (venues)
  const venues = [
    {
      name: "Salle de Concert Olympia",
      address: "28 Boulevard des Capucines",
      city: "Paris",
      postalCode: "75009",
      capacity: 2000,
      description: "Prestigieuse salle de concert parisienne",
    },
    {
      name: "Parc des Expositions",
      address: "1 Place de la Porte de Versailles",
      city: "Paris",
      postalCode: "75015",
      capacity: 5000,
      description: "Grand espace pour événements et salons",
    },
    {
      name: "Stade de France",
      address: "93200 Saint-Denis",
      city: "Saint-Denis",
      postalCode: "93200",
      capacity: 80000,
      description: "Stade emblématique pour grands événements",
    },
    {
      name: "Centre Culturel",
      address: "15 Rue de la Culture",
      city: "Paris",
      postalCode: "75001",
      capacity: 300,
      description: "Espace polyvalent pour événements culturels",
    },
  ];

  const createdVenues = [];
  for (const venue of venues) {
    const created = await prisma.venue.create({
      data: venue,
    });
    createdVenues.push(created);
    console.log(`✅ Lieu créé: ${venue.name}`);
  }

  // Créer des événements
  const now = new Date();
  const events = [
    {
      title: "Concert de Jazz",
      description: "Un super concert de jazz avec des artistes renommés. Venez découvrir des talents exceptionnels dans une ambiance chaleureuse.",
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3h
      venueId: createdVenues[0].id,
      capacity: 2000,
      price: 45.0,
      organizerId: createdUsers[0].id,
      categoryId: createdCategories[0].id,
      imageUrl: "https://example.com/jazz-concert.jpg",
    },
    {
      title: "Hackathon Tech 2026",
      description: "Rejoignez-nous pour 48h de développement intensif. Créez des projets innovants et rencontrez d'autres développeurs passionnés.",
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
      endDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000), // +2 jours
      venueId: createdVenues[1].id,
      capacity: 500,
      price: 0, // Gratuit
      organizerId: createdUsers[1].id,
      categoryId: createdCategories[2].id,
      imageUrl: "https://example.com/hackathon.jpg",
    },
    {
      title: "Match de Football - Finale",
      description: "Assistez à la finale du championnat. Un événement sportif à ne pas manquer !",
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
      venueId: createdVenues[2].id,
      capacity: 80000,
      price: 75.0,
      organizerId: createdUsers[0].id,
      categoryId: createdCategories[1].id,
      imageUrl: "https://example.com/football.jpg",
    },
    {
      title: "Exposition d'Art Moderne",
      description: "Découvrez les œuvres d'artistes contemporains émergents. Une expérience culturelle unique.",
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // Dans 10 jours
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // +6h
      venueId: createdVenues[3].id,
      capacity: 300,
      price: 15.0,
      organizerId: createdUsers[1].id,
      categoryId: createdCategories[3].id,
      imageUrl: "https://example.com/art-expo.jpg",
    },
    {
      title: "Festival Gastronomique",
      description: "Dégustez les spécialités de chefs renommés. Un voyage culinaire inoubliable.",
      startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // Dans 21 jours
      endDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000), // +2 jours
      venueId: createdVenues[1].id,
      capacity: 1000,
      price: 35.0,
      organizerId: createdUsers[0].id,
      categoryId: createdCategories[4].id,
      imageUrl: "https://example.com/food-festival.jpg",
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
    console.log(`✅ Événement créé: ${event.title}`);
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
