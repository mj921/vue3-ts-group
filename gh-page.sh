git checkout gh-page
git merge master
yarn build
git add .
git commit -m "gh-page"
git push origin gh-page
git checkout master
