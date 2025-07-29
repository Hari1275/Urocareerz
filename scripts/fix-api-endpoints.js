const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  // Admin APIs
  'src/app/api/admin/analytics/route.ts',
  'src/app/api/admin/opportunities/[id]/approve/route.ts',
  'src/app/api/admin/opportunities/[id]/reject/route.ts',
  
  // Application APIs
  'src/app/api/applications/[id]/status/route.ts',
  'src/app/api/applications/[id]/withdraw/route.ts',
  'src/app/api/applications/mentor/route.ts',
  'src/app/api/applications/route.ts',
  
  // Opportunity APIs
  'src/app/api/opportunities/[id]/route.ts',
  
  // Saved Opportunities API
  'src/app/api/saved-opportunities/route.ts',
  
  // Profile API
  'src/app/api/profile/route.ts',
  
  // Upload API
  'src/app/api/upload/route.ts',
  
  // User APIs
  'src/app/api/user/route.ts',
  'src/app/api/user/accept-terms/route.ts',
  
  // Download API
  'src/app/api/download/route.ts',
  
  // Discussion APIs
  'src/app/api/discussions/[id]/comments/route.ts',
  'src/app/api/discussions/[id]/route.ts',
  'src/app/api/discussions/route.ts',
  
  // Middleware
  'src/middleware.ts',
];

// Files to delete (old mentee opportunity APIs)
const filesToDelete = [
  'src/app/api/admin/mentee-opportunities/[id]/approve/route.ts',
  'src/app/api/admin/mentee-opportunities/[id]/reject/route.ts',
  'src/app/api/admin/mentee-opportunities/route.ts',
  'src/app/api/mentee-opportunities/[id]/route.ts',
  'src/app/api/mentee-opportunities/route.ts',
];

function updateFile(filePath) {
  console.log(`Updating ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found, skipping`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Replace menteeOpportunity references
  if (content.includes('menteeOpportunity')) {
    content = content.replace(/prisma\.menteeOpportunity\./g, 'prisma.opportunity.');
    content = content.replace(/MenteeOpportunity/g, 'Opportunity');
    updated = true;
    console.log(`  ✅ Replaced menteeOpportunity references`);
  }
  
  // Replace mentor references with creator
  if (content.includes('mentor:')) {
    content = content.replace(/mentor:\s*{/g, 'creator: {');
    updated = true;
    console.log(`  ✅ Replaced mentor: with creator:`);
  }
  
  // Replace mentorId with creatorId
  if (content.includes('mentorId')) {
    content = content.replace(/mentorId/g, 'creatorId');
    updated = true;
    console.log(`  ✅ Replaced mentorId with creatorId`);
  }
  
  // Replace opportunity.mentor with opportunity.creator
  if (content.includes('opportunity.mentor')) {
    content = content.replace(/opportunity\.mentor\./g, 'opportunity.creator.');
    updated = true;
    console.log(`  ✅ Replaced opportunity.mentor with opportunity.creator`);
  }
  
  // Replace application.opportunity.mentor with application.opportunity.creator
  if (content.includes('application.opportunity.mentor')) {
    content = content.replace(/application\.opportunity\.mentor\./g, 'application.opportunity.creator.');
    updated = true;
    console.log(`  ✅ Replaced application.opportunity.mentor with application.opportunity.creator`);
  }
  
  // Add null checks for decoded
  if (content.includes('decoded.userId') && !content.includes('decoded?.userId')) {
    content = content.replace(/decoded\.userId/g, 'decoded?.userId');
    updated = true;
    console.log(`  ✅ Added null checks for decoded.userId`);
  }
  
  if (content.includes('decoded.role') && !content.includes('decoded?.role')) {
    content = content.replace(/decoded\.role/g, 'decoded?.role');
    updated = true;
    console.log(`  ✅ Added null checks for decoded.role`);
  }
  
  // Add proper includes for applications
  if (content.includes('include: {') && content.includes('mentor:') && !content.includes('opportunity: {')) {
    content = content.replace(
      /include:\s*{\s*mentor:\s*{/g,
      'include: {\n            opportunity: {\n              include: {\n                creator: {'
    );
    content = content.replace(/},\s*}/g, '},\n              },\n            },');
    updated = true;
    console.log(`  ✅ Updated includes for applications`);
  }
  
  // Add proper includes for saved opportunities
  if (content.includes('include: {') && content.includes('mentor:') && content.includes('savedOpportunities')) {
    content = content.replace(
      /include:\s*{\s*mentor:\s*{/g,
      'include: {\n            creator: {'
    );
    updated = true;
    console.log(`  ✅ Updated includes for saved opportunities`);
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ File updated successfully`);
  } else {
    console.log(`  ℹ️  No changes needed`);
  }
}

function deleteFile(filePath) {
  console.log(`Deleting ${filePath}...`);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`  ✅ File deleted`);
  } else {
    console.log(`  ⚠️  File not found, skipping`);
  }
}

function main() {
  console.log('🔧 Fixing API endpoints for unified opportunities...\n');
  
  // Update files
  filesToUpdate.forEach(updateFile);
  
  console.log('\n🗑️  Deleting old mentee opportunity APIs...\n');
  
  // Delete old files
  filesToDelete.forEach(deleteFile);
  
  console.log('\n✅ API endpoint fixes completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Run "npx tsc --noEmit" to check for remaining TypeScript errors');
  console.log('2. Test the application to ensure everything works correctly');
  console.log('3. Update any remaining frontend components if needed');
}

if (require.main === module) {
  main();
}

module.exports = { updateFile, deleteFile, main }; 