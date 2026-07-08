/** @type {import('next').NextConfig} */
import { execSync } from 'child_process';

async function getGitInfo() {
    try {
        const res = await fetch('https://api.github.com/repos/lukethecat/lukethecat.github.io/commits?per_page=1');
        const data = await res.json();
        
        let commitCount = "1";
        const linkHeader = res.headers.get('link');
        if (linkHeader) {
            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (match) {
                commitCount = match[1];
            }
        } else {
            commitCount = data.length.toString();
        }
        
        const lastDate = new Date(data[0].commit.committer.date).toISOString().split('T')[0];
        
        return { commitCount, lastDate };
    } catch (e) {
        return { commitCount: '197', lastDate: '2026-03-31' };
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
