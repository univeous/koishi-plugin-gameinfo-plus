import { Context, h, Schema, sleep } from 'koishi'
import {} from "koishi-plugin-puppeteer"
import { Page } from "puppeteer-core"
import { resolve } from 'path'

export const name = 'gameinfo-plus'
export const usage = `
查询多平台游戏价格信息。
`

export interface Config {
  wrongList?: string[]
}

export const Config: Schema<Config> = Schema.object({
  wrongList: Schema.array(String).default(['错误的', 'n', '0']).description("匹配错误时，回复这些词中的任意一个来获取gameid列表。")
})


export function apply(ctx: Context, config: Config) {
  ctx.command('gameinfo <name:text>', "查询游戏信息")
  .action(async ({session}, text) => {
    const resp = await ctx.http.get(`https://v2.diershoubing.com/eb/combine_game/search/?src=ios&version=9.54&search_name=${text}`)
    const gameData = resp.combine_games
    if(gameData.length == 0) return '没有找到该游戏。'
    const chineseName = gameData[0].name
    const gameId = gameData[0].game_id

    session.execute(`gameid ${gameId}`)
    session.send(`你要找的可能是${chineseName}。若不是，请回复[${String(config.wrongList)}]中的任意一个。`)
    const answer = await session.prompt()
    if(config.wrongList.includes(answer)){
      session.send(<html style={{
        color: '#ffffff',
        background: '#333333',
        padding: '1rem',
      }}>
        <style>{`
          th, td {
            padding: 0.25rem 0.5rem;
          }
        `}</style>
        <table>
          <tr>
            <th class="index">game id</th>
            <th class="title">游戏名</th>
          </tr>
          {gameData.map((t, _) => <tr>
            <td>{t.game_id}</td>
            <td>{t.name}</td>
          </tr>)}
        </table>
      </html>)
      session.send('请输入正确的 game_id：')
      const appid = await session.prompt()
      session.execute(`gameid ${appid}`)
    } else if(answer){
      session.execute(answer)
    }

  })

  ctx.command('gameid <appid>', '根据gameid查询游戏信息')
  .action(async (_, appid) => {
    const resp = await ctx.http.get(`https://v2.diershoubing.com/eb/combine_game/detail/${appid}/?src=ios&version=9.54&pf=1`)
    if(resp.ret === "-1") return `未找到${appid}。`
    let page: Page
    page = await ctx.puppeteer.page()
    try {
      page = await ctx.puppeteer.page()
      await page.goto(`file:///${resolve(__dirname, "./card/template.html")}`)
      await page.evaluate(`action(${JSON.stringify(resp)})`)
      await page.waitForNetworkIdle()
      await page.evaluate(`repos()`)
      const element = await page.$('#app')
      return h.image(await element.screenshot({
        encoding: "binary"
      }), "image/png")

    } catch (error) {
      return error.message
    } finally {
      page?.close()
    }
  })
}
