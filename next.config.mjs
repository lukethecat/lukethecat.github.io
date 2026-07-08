/** @type {import('next').NextConfig} */
import { execSync } from 'child_process';

async function getGitInfo() {
    try {
        const res = await fetch('https://api.github.com/repos/lukethecat/lukethecat.github.io/deployments?per_page=1');
        const data = await res.json();
        
        let commitCount = "1";
        const linkHeader = res.headers.get('link');
        if (linkHeader) {
            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (match) {
                // The newest deployment is currently running (this one) or about to run
                // So adding 1 gives the exact deployment count including the current one!
                commitCount = (parseInt(match[1]) + 1).toString();
            }
        } else {
            commitCount = (data.length + 1).toString();
        }
        
        // Use the current time for this build's deployment time since it's happening right now
        // But the lastDate is usually just the day.
        const lastDate = new Date().toISOString().split('T')[0];
        
        return { commitCount, lastDate };
    } catch (e) {
        return { commitCount: '256', lastDate: '2026-07-08' };
    }
}

const git = await getGitInfo();
const buildTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

const nextConfig = {
    output: 'export',
    typescript: {
        ignoreBuildErrors: true,
    },
    env: {
        NEXT_PUBLIC_GIT_COMMIT_COUNT: git.commitCount,
        NEXT_PUBLIC_GIT_LAST_DATE: git.lastDate,
        NEXT_PUBLIC_BUILD_TIME: buildTime,
    },
};

export default nextConfig;
