const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const userModel = require("../models/user.model");
const postModel = require("../models/post.model");
const commentModel = require("../models/comment.model");
const likeModel = require("../models/like.model");
const storyModel = require("../models/story.model");
const followModel = require("../models/follow.model");

// Load Environment variables from Backend/.env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const demoUsers = [
  {
    username: "aaditya_codes",
    email: "aaditya@socialnest.in",
    password: "Password123",
    fullName: "Aaditya Sharma",
    bio: "Hustling at a Bangalore startup. Building the future one coffee & bug at a time. ☕💻",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "riya_clicks",
    email: "riya@socialnest.in",
    password: "Password123",
    fullName: "Riya Sen",
    bio: "Delhi streets under neon & monsoon. Capturing stories of old corners & warm chai. 📸🍂",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "kabir_biker",
    email: "kabir@socialnest.in",
    password: "Password123",
    fullName: "Kabir Malhotra",
    bio: "Leh-Ladakh is not a place, it's an emotion. Riding through the majestic Himalayas. 🏔️🏍️",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "priya_style",
    email: "priya@socialnest.in",
    password: "Password123",
    fullName: "Priya Patel",
    bio: "Aesthetic curator. Blending modern streetwear with traditional Indian textiles. ✨👠",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "arjun_fitness",
    email: "arjun@socialnest.in",
    password: "Password123",
    fullName: "Arjun Deshmukh",
    bio: "Consistency over intensity. Train dirty, eat clean. Calisthenics & yoga practitioner. 🧘‍♂️💪",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "diya_writes",
    email: "diya@socialnest.in",
    password: "Password123",
    fullName: "Diya Banerjee",
    bio: "Sipping black coffee, reading Tagore, and writing about late-night thoughts. 📝☕",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "rohit_cricket",
    email: "rohit@socialnest.in",
    password: "Password123",
    fullName: "Rohit Verma",
    bio: "Bleeding blue since 2007. Cricket isn't just a sport, it's a religion. Wankhede roars. 🏏💥",
    profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "ananya_travels",
    email: "ananya@socialnest.in",
    password: "Password123",
    fullName: "Ananya Nair",
    bio: "Backwaters, coconut trees & green hills. Exploring the hidden gems of Kerala. 🌴🛶",
    profileImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "isha_foodie",
    email: "isha@socialnest.in",
    password: "Password123",
    fullName: "Isha Reddy",
    bio: "On a permanent search for the perfect Biryani. Spiced with sarcasm and pure ghee. 🌶️🍚",
    profileImage: "https://images.unsplash.com/photo-1534751516642-a131fed10495?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "shubham_beats",
    email: "shubham@socialnest.in",
    password: "Password123",
    fullName: "Shubham Mishra",
    bio: "Acoustic vibes, lo-fi beats & soulful ragas. Creating late-night music in my room. 🎵🎸",
    profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "ishaan_hustles",
    email: "ishaan@socialnest.in",
    password: "Password123",
    fullName: "Ishaan Kapoor",
    bio: "Failed three times, building the fourth. Hustling in Indiranagar, Bangalore. 🚀📈",
    profileImage: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "tanvi_art",
    email: "tanvi@socialnest.in",
    password: "Password123",
    fullName: "Tanvi Joshi",
    bio: "Watercolors, mandalas, and murals. Reviving traditional Rajasthani patterns. 🎨🕌",
    profileImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "neil_memes",
    email: "neil@socialnest.in",
    password: "Password123",
    fullName: "Neil D'Souza",
    bio: "Your daily dose of high-tier developer humor, gully memes, and anime pain. 🥑🌶️",
    profileImage: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "dev_nomad",
    email: "dev@socialnest.in",
    password: "Password123",
    fullName: "Devansh Singhal",
    bio: "Cozy desk setups, clean code & slow travel. Living out of a backpack in Himachal. 🎒💻",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "meera_designs",
    email: "meera@socialnest.in",
    password: "Password123",
    fullName: "Meera Iyer",
    bio: "Symmetry, indoor plants, and cozy Indian homes. Designing spaces with peace & wood. 🌿🏡",
    profileImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "varun_culinary",
    email: "varun@socialnest.in",
    password: "Password123",
    fullName: "Varun Nair",
    bio: "Reinventing traditional Malabari cuisine. Spices, stories, and immersive plating. 👨‍🍳🍛",
    profileImage: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "sneha_vocals",
    email: "sneha@socialnest.in",
    password: "Password123",
    fullName: "Sneha Rao",
    bio: "Classical Carnatic vocals meets lo-fi production. Healing one soundwave at a time. 🎤🎶",
    profileImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "karan_fit",
    email: "karan@socialnest.in",
    password: "Password123",
    fullName: "Karan Malhotra",
    bio: "Calisthenics athlete. Delhi street food enthusiast. Balancing macros & momos. 🏋️‍♂️🥟",
    profileImage: "https://images.unsplash.com/photo-1480427461922-7db3865b86f4?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "alisha_clicks",
    email: "alisha@socialnest.in",
    password: "Password123",
    fullName: "Alisha Roy",
    bio: "Capturing faces of Kolkata. Retro portraits, vintage film grains, and warm tones. 🎞️🍁",
    profileImage: "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  },
  {
    username: "vivek_sketches",
    email: "vivek@socialnest.in",
    password: "Password123",
    fullName: "Vivek Solanki",
    bio: "Charcoal sketching. Capturing Mumbai local trains, Marine Drive, and daily hustlers. ✏️🌉",
    profileImage: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=300&h=300&fit=crop",
    isOnboarded: true,
    isVerified: true,
    isDemoUser: true
  }
];

const demoPosts = [
  {
    userIndex: 0, // aaditya_codes
    caption: "Bangalore weather + late-night coding sessions + filter coffee = Peak developer productivity. ☕💻 #startup #bangalore #coding",
    imgUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&fit=crop"
  },
  {
    userIndex: 0,
    caption: "When the production bug is finally resolved at 3 AM. Time to sleep! 😴 #developer #techlife",
    imgUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop"
  },
  {
    userIndex: 1, // riya_clicks
    caption: "Chai is not just tea, it's a feeling of warmth in the Delhi winter breeze. 🍂☕ #delhi #chai #streetstyle",
    imgUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&fit=crop"
  },
  {
    userIndex: 1,
    caption: "Monsoon reflections at Connaught Place. Delhi looks magical under gray clouds. 🌧️🏛️ #monsoon #photography",
    imgUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&fit=crop"
  },
  {
    userIndex: 2, // kabir_biker
    caption: "Waking up to the view of snow peaks in Pangong Tso. The cold air is therapeutic. 🏔️🏍️ #riding #himalayas #ladakh",
    imgUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&fit=crop"
  },
  {
    userIndex: 2,
    caption: "Riding into the sunset. The road is my home. 🌄🏍️ #bikelife #wanderlust",
    imgUrl: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=800&fit=crop"
  },
  {
    userIndex: 3, // priya_style
    caption: "Banarasi silk meets modern denim. Traditional with a modern twist. ✨👠 #streetwear #mumbaifashion",
    imgUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&fit=crop"
  },
  {
    userIndex: 3,
    caption: "Vintage grain, street vibes, and golden hour light. Bandra nights are cozy. 🎞️✨ #retro #fashion",
    imgUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&fit=crop"
  },
  {
    userIndex: 4, // arjun_fitness
    caption: "No shortcuts, just consistent sweat. Early morning calisthenics workout hits different. 🧘‍♂️💪 #fitness #pune #calisthenics",
    imgUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&fit=crop"
  },
  {
    userIndex: 4,
    caption: "Finding balance amidst the chaos. Nature is the best gym. 🌿🧘‍♂️ #yoga #mindfulness #lonavala",
    imgUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&fit=crop"
  },
  {
    userIndex: 5, // diya_writes
    caption: "Reading Tagore on a quiet Sunday afternoon. Kolkata monsoons make me write. 📝☕ #kolkata #poetry",
    imgUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&fit=crop"
  },
  {
    userIndex: 5,
    caption: "Some thoughts are meant to remain unfinished on paper. 📝🍁 #writing #notes",
    imgUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&fit=crop"
  },
  {
    userIndex: 6, // rohit_cricket
    caption: "Wankhede is roaring! The atmosphere is electric. Bleeding blue forever! 🏏💥 #cricket #ipl #mumbai",
    imgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&fit=crop"
  },
  {
    userIndex: 6,
    caption: "Sunday morning gully cricket with the boys hits different. 🏏☀️ #childhoodmemories #gullycricket",
    imgUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&fit=crop"
  },
  {
    userIndex: 7, // ananya_travels
    caption: "Floating through Alleppey backwaters on a quiet morning. Truly God's Own Country. 🌴🛶 #kerala #travel",
    imgUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop"
  },
  {
    userIndex: 7,
    caption: "Lost in the green hills of Munnar. The fresh tea leaves smell like heaven. 🍃🏔️ #munnar #nomad",
    imgUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop"
  },
  {
    userIndex: 8, // isha_foodie
    caption: "The only true love is a steaming plate of authentic Hyderabadi Biryani with extra ghee. 🌶️🍚 #hyderabad #biryani #foodie",
    imgUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&fit=crop"
  },
  {
    userIndex: 8,
    caption: "Spicy panipuri sessions on a rainy evening are mandatory. 🌶️😋 #streetfood #chaat",
    imgUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=800&fit=crop"
  },
  {
    userIndex: 9, // shubham_beats
    caption: "Modulating some chords for my next lo-fi track. Acoustic feels under fairy lights. 🎵🎸 #lofi #singersongwriter",
    imgUrl: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=800&fit=crop"
  },
  {
    userIndex: 9,
    caption: "Late night hums and sound modulation in my home studio. 🎧🎹 #indiemusic",
    imgUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&fit=crop"
  }
];

const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/socialnest";
    console.log("🌱 Connecting to MongoDB at:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("✅ Database connected successfully.");

    console.log("🧹 Clearing existing collection data...");
    await Promise.all([
      userModel.deleteMany({ isDemoUser: true }),
      postModel.deleteMany({ tags: { $in: ["seed", "demo"] } }),
      storyModel.deleteMany({}),
      followModel.deleteMany({})
    ]);
    console.log("✅ Stale collections cleaned.");

    console.log("👤 Creating demo users...");
    const createdUsers = [];
    for (const u of demoUsers) {
      // Use standard mongoose create to trigger model hashing/saving
      const user = await userModel.create(u);
      createdUsers.push(user);
    }
    console.log(`✅ ${createdUsers.length} Users seeded successfully.`);

    console.log("📝 Seeding social posts...");
    const createdPosts = [];
    for (const p of demoPosts) {
      const author = createdUsers[p.userIndex];
      if (!author) continue;
      const post = await postModel.create({
        caption: p.caption,
        imgUrl: p.imgUrl,
        user: author._id,
        isPublic: true,
        tags: ["seed", "demo"]
      });
      createdPosts.push(post);
    }
    console.log(`✅ ${createdPosts.length} Posts seeded successfully.`);

    console.log("💬 Creating authentic interactions (Likes, Comments)...");
    const commentsList = [
      "bro this edit 🔥",
      "yaar vibe hai fr!",
      "need this life fr",
      "clean setup bhai",
      "peak aesthetics 😭",
      "Beautifully captured!",
      "This Biryani looks heavenly 🌶️ Rice is love",
      "Sach me vibe h bro!",
      "Indiranagar hustle fr 🚀"
    ];

    for (let i = 0; i < createdPosts.length; i++) {
      const post = createdPosts[i];
      // Every user likes every post
      for (const user of createdUsers) {
        await likeModel.create({ post: post._id, user: user._id });
        await postModel.findByIdAndUpdate(post._id, {
          $addToSet: { likes: user._id },
          $inc: { likesCount: 1 }
        });

        // Add comments
        const randomComment = commentsList[Math.floor(Math.random() * commentsList.length)];
        const comment = await commentModel.create({
          content: randomComment,
          user: user._id,
          post: post._id
        });
        await postModel.findByIdAndUpdate(post._id, {
          $addToSet: { comments: comment._id },
          $inc: { commentsCount: 1 }
        });
      }
    }
    console.log("✅ Engagement metrics updated.");

    console.log("🤝 Seeding social follow relations...");
    for (const follower of createdUsers) {
      for (const followee of createdUsers) {
        if (follower._id.toString() !== followee._id.toString()) {
          await followModel.create({
            follower: follower._id,
            followee: followee._id,
            status: "accepted"
          });
        }
      }
    }
    console.log("✅ Symmetric social follower graphs established.");

    console.log("✨ Seeding stories...");
    for (const user of createdUsers) {
      await storyModel.create({
        user: user._id,
        media: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&fit=crop",
        mediaType: "image",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }
    console.log("✅ Stories seeded successfully.");

    console.log("\n🚀 SocialNest database successfully populated with rich Indian localized cold-start fallback data!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed with error:", err);
    process.exit(1);
  }
};

runSeed();
