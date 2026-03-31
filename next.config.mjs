/** @type {import('next').NextConfig} */
import { execSync } from 'child_process';

function getGitInfo() {
    try {
        const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
        const lastDate = execSync('git log -1 --format="%ci"', { encoding: 'utf8' }).trim();
        // Extract just the date part (YYYY-MM-DD)
        const dateOnly = lastDate.split(' ')[0];
        return { commitCount, lastDate: dateOnly };
    } catch {
        return { commitCount: '0', lastDate: 'unknown' };
    }
}

const git = getGitInfo();

const nextConfig = {
    output: 'export',
    typescript: {
        ignoreBuildErrors: true,
    },
    env: {
        NEXT_PUBLIC_GIT_COMMIT_COUNT: git.commitCount,
        NEXT_PUBLIC_GIT_LAST_DATE: git.lastDate,
    },
};

export default nextConfig;
