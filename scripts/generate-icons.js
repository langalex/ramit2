import sharp from 'sharp';
import fs from 'fs';

// Icon sizes needed for iOS and Android
const iconSizes = [180, 192, 512];

async function generateIcon(size, outputPath) {
  try {
    await sharp('static/icon.svg').resize(size, size).png().toFile(outputPath);

    console.log(`✅ Generated ${outputPath} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Failed to generate ${outputPath}:`, error.message);
  }
}

async function generateMaskableIcon(size, safeSize, outputPath) {
  try {
    const padding = Math.round((size - safeSize) / 2);

    // Create a transparent background with padding
    const background = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    // Resize the icon to safeSize
    const icon = await sharp('static/icon.svg').resize(safeSize, safeSize).png().toBuffer();

    // Composite the icon onto the background, centered
    await background
      .composite([
        {
          input: icon,
          top: padding,
          left: padding
        }
      ])
      .png()
      .toFile(outputPath);

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

  // Generate icons
  console.log('\n🌐 Generating icons...');
  for (const size of iconSizes) {
    await generateIcon(size, `static/icon-${size}.png`);
  }
  await generateMaskableIcon(512, 360, 'static/icon-mask.png');

  // Generate favicon.png
  console.log('\n🔖 Generating favicon...');
  try {
    await sharp('static/icon.svg').resize(32, 32).png().toFile('static/favicon.png');

    console.log('✅ Generated static/favicon.png (32x32)');
  } catch (error) {
    console.error('❌ Failed to generate favicon:', error.message);
  }

  console.log('\n🎉 Icon generation complete!');
}

// Run the script
generateAllIcons().catch(console.error);
