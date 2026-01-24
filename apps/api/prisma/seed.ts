import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default settings
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      defaultServings: 2,
      gramsPerServing: 15,
    },
  });
  console.log('Created settings:', settings.id);

  // Create default grinder state
  const grinder = await prisma.grinderState.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      grinderModel: 'Comandante C40',
      currentSetting: 20,
    },
  });
  console.log('Created grinder state:', grinder.id);

  // Create default methods
  const v60 = await prisma.method.upsert({
    where: { name: 'v60' },
    update: {},
    create: {
      name: 'v60',
      displayName: 'V60',
      scalingRules: JSON.stringify({
        scalesPours: true,
        scalesDose: true,
        scalesWater: true,
      }),
      defaultParams: JSON.stringify({
        ratio: 16,
        waterTemp: 96,
        grindSize: 40,
        dose: 15,
        bloomRatio: 2,
        bloomTime: 45,
      }),
      steps: JSON.stringify([
        { name: 'Bloom', waterRatio: 2, duration: 45, notes: 'Gentle circular pour, swirl' },
        { name: 'First pour', waterRatio: 6, duration: 30, notes: 'Slow circular pour to 60%' },
        { name: 'Second pour', waterRatio: 8, duration: 30, notes: 'Continue to target weight' },
        { name: 'Drawdown', duration: 60, notes: 'Wait for complete drawdown' },
      ]),
    },
  });
  console.log('Created method:', v60.name);

  const moka = await prisma.method.upsert({
    where: { name: 'moka' },
    update: {},
    create: {
      name: 'moka',
      displayName: 'Moka Pot',
      scalingRules: JSON.stringify({
        scalesPours: false,
        scalesDose: true,
        scalesWater: false,
      }),
      defaultParams: JSON.stringify({
        grindSize: 35,
        preheatedWater: true,
        heatLevel: 'medium-low',
      }),
      steps: JSON.stringify([
        { name: 'Prep', notes: 'Fill bottom with hot water to valve, add grounds' },
        { name: 'Heat', notes: 'Medium-low heat, lid open' },
        { name: 'Watch', notes: 'When coffee starts flowing, reduce heat' },
        { name: 'Stop', notes: 'Remove from heat when sputtering starts' },
        { name: 'Cool', notes: 'Run cold water on bottom to stop extraction' },
      ]),
    },
  });
  console.log('Created method:', moka.name);

  const espresso = await prisma.method.upsert({
    where: { name: 'espresso' },
    update: {},
    create: {
      name: 'espresso',
      displayName: 'Espresso',
      scalingRules: JSON.stringify({
        scalesPours: false,
        scalesDose: true,
        scalesWater: true,
      }),
      defaultParams: JSON.stringify({
        ratio: 2,
        dose: 18,
        yield: 36,
        grindSize: 14,
        waterTemp: 93,
        extractionTime: 28,
      }),
      steps: JSON.stringify([
        { name: 'Grind', notes: 'Grind fresh, distribute evenly in portafilter' },
        { name: 'Tamp', notes: 'Level tamp with consistent pressure' },
        { name: 'Extract', notes: 'Pull shot, aim for 25-30 seconds' },
        { name: 'Evaluate', notes: 'Check flow rate and color' },
      ]),
    },
  });
  console.log('Created method:', espresso.name);

  const frenchPress = await prisma.method.upsert({
    where: { name: 'french_press' },
    update: {},
    create: {
      name: 'french_press',
      displayName: 'French Press',
      scalingRules: JSON.stringify({
        scalesPours: false,
        scalesDose: true,
        scalesWater: true,
      }),
      defaultParams: JSON.stringify({
        ratio: 15,
        waterTemp: 96,
        grindSize: 60,
        steepTime: 240,
      }),
      steps: JSON.stringify([
        { name: 'Add coffee', notes: 'Add coarse ground coffee to carafe' },
        { name: 'Bloom', duration: 30, notes: 'Add small amount of water, stir gently' },
        { name: 'Fill', notes: 'Add remaining water, place lid without pressing' },
        { name: 'Steep', duration: 240, notes: 'Wait 4 minutes total' },
        { name: 'Press', notes: 'Press plunger slowly and steadily' },
        { name: 'Serve', notes: 'Pour immediately to avoid over-extraction' },
      ]),
    },
  });
  console.log('Created method:', frenchPress.name);

  console.log('Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
