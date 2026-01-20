import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VEHICLE_CATALOG = [
  { make: 'Toyota', model: 'Vios' },
  { make: 'Toyota', model: 'Corolla Cross' },
  { make: 'Toyota', model: 'Fortuner' },
  { make: 'Toyota', model: 'Innova' },
  { make: 'Toyota', model: 'Camry' },
  { make: 'Honda', model: 'City' },
  { make: 'Honda', model: 'CR-V' },
  { make: 'Honda', model: 'Civic' },
  { make: 'Honda', model: 'HR-V' },
  { make: 'Hyundai', model: 'i10' },
  { make: 'Hyundai', model: 'Accent' },
  { make: 'Hyundai', model: 'Tucson' },
  { make: 'Hyundai', model: 'Santa Fe' },
  { make: 'Kia', model: 'Morning' },
  { make: 'Kia', model: 'Seltos' },
  { make: 'Kia', model: 'Sonet' },
  { make: 'Kia', model: 'K3' },
  { make: 'Kia', model: 'Carnival' },
  { make: 'Mazda', model: 'Mazda3' },
  { make: 'Mazda', model: 'Mazda6' },
  { make: 'Mazda', model: 'CX-5' },
  { make: 'Mazda', model: 'CX-8' },
  { make: 'Ford', model: 'Ranger' },
  { make: 'Ford', model: 'Everest' },
  { make: 'Ford', model: 'Territory' },
  { make: 'Mitsubishi', model: 'Xpander' },
  { make: 'Mitsubishi', model: 'Outlander' },
  { make: 'Mitsubishi', model: 'Triton' },
  { make: 'Suzuki', model: 'Ertiga' },
  { make: 'Suzuki', model: 'XL7' },
  { make: 'VinFast', model: 'Fadil' },
  { make: 'VinFast', model: 'Lux A2.0' },
  { make: 'VinFast', model: 'Lux SA2.0' },
  { make: 'VinFast', model: 'VF e34' },
  { make: 'VinFast', model: 'VF 8' },
];

const PLATE_PREFIXES = ['30A', '29A', '51F', '43A', '59A', '61A', '18A', '37A'];

const randomYear = (start: number, end: number) =>
  start + Math.floor(Math.random() * (end - start + 1));

const makeVin = (index: number) =>
  `VN${String(index + 1).padStart(15, '0')}`;

const makePlate = (index: number) => {
  const prefix = PLATE_PREFIXES[index % PLATE_PREFIXES.length];
  const serial = String(10000 + index).slice(-5);
  return `${prefix}-${serial}`;
};

const main = async () => {
  const users = await prisma.user.findMany({ select: { id: true } });

  if (users.length === 0) {
    console.error('No users found. Run seed:users first.');
    process.exitCode = 1;
    return;
  }

  const vehicles = VEHICLE_CATALOG.map((vehicle, index) => ({
    ...vehicle,
    userId: users[index % users.length].id,
    year: randomYear(2016, 2024),
    vin: makeVin(index),
    plateNumber: makePlate(index),
  }));

  const result = await prisma.vehicle.createMany({
    data: vehicles,
    skipDuplicates: true,
  });

  console.log(`Inserted ${result.count} vehicles`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
