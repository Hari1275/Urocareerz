const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOTPFunctionality() {
    try {
        console.log('🧪 Testing OTP Functionality...\n');

        // Test 1: Check database connection
        console.log('1. Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connection successful');

        // Test 2: Find a test user
        console.log('\n2. Finding test user...');
        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            take: 1,
            select: { id: true, firstName: true, lastName: true, email: true, otpSecret: true, otpExpiry: true }
        });

        if (users.length === 0) {
            console.log('⚠️  No users found in database');
            return;
        }

        const testUser = users[0];
        console.log(`✅ Found test user: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`);
        console.log(`   Current OTP: ${testUser.otpSecret || 'None'}`);
        console.log(`   OTP Expiry: ${testUser.otpExpiry || 'None'}`);

        // Test 3: Test OTP generation and update
        console.log('\n3. Testing OTP generation and update...');

        const testOTP = '123456';
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        const updatedUser = await prisma.user.update({
            where: { id: testUser.id },
            data: {
                otpSecret: testOTP,
                otpExpiry: otpExpiry,
            },
            select: { id: true, email: true, otpSecret: true, otpExpiry: true }
        });

        console.log(`✅ Successfully updated user OTP:`);
        console.log(`   OTP: ${updatedUser.otpSecret}`);
        console.log(`   Expiry: ${updatedUser.otpExpiry}`);

        // Test 4: Test OTP verification (simulate the verification process)
        console.log('\n4. Testing OTP verification simulation...');

        const userToVerify = await prisma.user.findUnique({
            where: { id: testUser.id },
            select: { id: true, email: true, otpSecret: true, otpExpiry: true }
        });

        if (userToVerify && userToVerify.otpSecret === testOTP) {
            console.log('✅ OTP verification would succeed');

            // Clear OTP after successful verification (simulation)
            await prisma.user.update({
                where: { id: testUser.id },
                data: {
                    otpSecret: null,
                    otpExpiry: null,
                }
            });

            console.log('✅ OTP cleared after verification');
        } else {
            console.log('❌ OTP verification would fail');
        }

        console.log('\n🎉 OTP functionality test completed!');

    } catch (error) {
        console.error('❌ Error testing OTP functionality:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testOTPFunctionality();
