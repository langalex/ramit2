import sharp from 'sharp';
import fs from 'fs';

// Icon sizes needed for iOS and Android
const iconSizes = [
  // iOS sizes
  180, 167, 152, 120, 87, 80, 76, 60, 40, 29,
  // Android sizes
  192, 144, 96, 72, 48, 36
];

// PWA icon sizes
const pwaSizes = [192, 512];

async function generateIcon(size, outputPath) {
  try {
    await sharp('static/icon.svg').resize(size, size).png().toFile(outputPath);

    console.log(`✅ Generated ${outputPath} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Failed to generate ${outputPath}:`, error.message);
  }
}

async function generateAllIcons() {
  console.log('🎨 Generating icons for iOS and Android...\n');

  // Ensure static directory exists
  if (!fs.existsSync('static')) {
    console.error(
      "❌ static directory not found. Make sure you're running this from the project root."
    );
    return;
  }

  // Generate iOS icons
  console.log('📱 Generating iOS icons...');
  for (const size of iconSizes) {
    if (size === 180) {
      // iOS default icon
      await generateIcon(size, 'static/apple-touch-icon.png');
    } else {
      // iOS specific size icons
      await generateIcon(size, `static/apple-touch-icon-${size}x${size}.png`);
    }
  }

  // Generate Android icons
  console.log('\n🤖 Generating Android icons...');
  for (const size of iconSizes) {
    await generateIcon(size, `static/icon-${size}.png`);
  }

  // Generate PWA icons
  console.log('\n🌐 Generating PWA icons...');
  for (const size of pwaSizes) {
    await generateIcon(size, `static/icon-${size}.png`);
  }

  // Generate favicon.ico (16x16, 32x32, 48x48)
  console.log('\n🔖 Generating favicon...');
  try {
    await sharp('static/icon.svg').resize(32, 32).png().toFile('static/favicon.png');

    console.log('✅ Generated static/favicon.png (32x32)');
    console.log('💡 Note: favicon.ico needs to be created separately or use favicon.png');
  } catch (error) {
    console.error('❌ Failed to generate favicon:', error.message);
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Test your app on iOS/Android devices');
  console.log('2. Add to home screen to verify icons display correctly');
  console.log('3. Check PWA installation in Chrome DevTools');
}

// Run the script
generateAllIcons().catch(console.error);
