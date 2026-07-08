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
    console.error(e);
    return { commitCount: 'unknown', lastDate: 'unknown' };
  }
}
getGitInfo().then(console.log);
