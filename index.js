const http = require('http');
const port = 3000;
const host = 'localhost';

function sendRequest(url) {
    return fetch(url).then((response) => {
        return response.json();
    })
}

// sendRequest('https://rinh-api.kovalev.team/article/53348')
//     .then((article) => {
//         console.log(article);
//     })

let staff = [];
let articles = [];
let myArticles = [];

sendRequest('https://rinh-api.kovalev.team/employee/find-by-department/31')
    .then((workers) => {
        return workers;
    })
    .then((workers) => {
        const currentYear = new Date().getFullYear();
        let counter = 0;
        workers.forEach(worker => {
            sendRequest(`https://rinh-api.kovalev.team/publication/employee/findByEmployeeId?employeeId=${worker.id}&startYear=1900&endYear=${currentYear}`)
                .then(async workerArticles => {
                    let citiedCount = 0;
                    let mostCitied = {};
                    workerArticles.articleInfo.forEach((article) => {
                        if (article.article.citiedByCount) {
                            citiedCount = citiedCount + article.article.citiedByCount;
                            if (!Object.keys(mostCitied).length) {
                                mostCitied = article.article;
                            } else {
                                if (mostCitied.citiedByCount < article.article.citiedByCount) {
                                    mostCitied = article.article;
                                }
                            }
                        }
                    })
                    let nameArray = workerArticles.employee.fullName.split(' ');
                    let initials;
                    if (nameArray[0].length < 4) {
                        initials = `${nameArray[0]} ${nameArray[1]} ${nameArray[2].slice(0, 1)}.`;
                    } else {
                        initials = `${nameArray[0]} ${nameArray[1].slice(0, 1)}. ${nameArray[2].slice(0, 1)}.`;
                    }
                    let employee = {
                        name: workerArticles.employee.fullName,
                        id: workerArticles.employee.id,
                        initials: initials,
                        articlesCount: workerArticles.articleInfo.length,
                        avatarUrl: workerArticles.employee.avatarUrl,
                        allCitied: citiedCount,
                        mostCitied: mostCitied,
                        commonWorkExperience: workerArticles.employee.commonWorkExperience,
                        academicDegreeId: workerArticles.employee.academicDegreeId,
                        positionId: workerArticles.employee.positionId,
                    }
                    staff.push(employee);
                    if (!articles.length) {
                        workerArticles.articleInfo.forEach(workerArticle => {
                            articles.push(workerArticle);
                        })
                    } else {
                        for (let i = 0; i < workerArticles.articleInfo.length; i++) {
                            let proverka = 0;
                            // if (workerArticles.articleInfo[i].article.id === 53348) {
                            //     console.log(workerArticles.articleInfo[i]);
                            // }
                            for (let j = 0; j < articles.length; j++) {
                                if (workerArticles.articleInfo[i].article.id === articles[j].article.id) {
                                    proverka = 1;
                                    break;
                                }
                            }
                            if (!proverka) {
                                articles.push(workerArticles.articleInfo[i]);
                            }
                        }
                    }
                    counter++;
                    if (counter === workers.length) {
                        console.log(staff);
                    }
                    return articles;
                })
                .then((articles) => {
                    if (counter === workers.length) {
                        // console.log(staff);
                        articles.forEach(workerArticle => {
                            let authorsID = [];
                            workerArticle.authors.forEach((author) => {
                                authorsID.push(author.id);
                            })
                            let thisArticle = {
                                title: workerArticle.article.title,
                                id: workerArticle.article.id,
                                authorsRaw: `${workerArticle.article.authorsRaw}`,
                                authorsID: `${authorsID}`,
                                year: workerArticle.journal.year,
                                indexator: workerArticle.journal.indexator,
                                journal: workerArticle.journal.title,
                                doi: workerArticle.article.doi,
                                citiedByCount: workerArticle.article.citiedByCount,
                            }
                            myArticles.push(thisArticle);
                        })
                        // console.log(myArticles);
                        let server = http.createServer((req, res) => {
                            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                            switch (req.url) {
                                case '/':
                                    res.end(JSON.stringify(myArticles));
                                    break;
                                case '/staff':
                                    res.end(JSON.stringify(staff));
                                    break;
                                default:
                                    res.end("NOT FOUND");
                            }

                        })

                        server.listen(port, host, () => {
                            console.log(`Серв запущен: http://${host}:${port}`);
                        })
                    }
                })
                .then((myArticles) => {

                })
        })
    })
