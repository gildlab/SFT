<script>
    import {icons} from '../scripts/assets.js';
    import LandingNav from '../components/LandingNav.svelte';
    import EcosystemsTemplate from '../components/EcosystemsTemplate.svelte';

</script>
<div class="transparency-container">
  <div class="poem-gradient10"></div>
  <LandingNav/>
  <EcosystemsTemplate icon="{icons.issuers_icon}" hero="{icons.issuers_hero}" name="Issuers" iconBackground="#4a64a5">
    <div slot="gradients">
      <div class="poem-gradient1"></div>
      <div class="poem-gradient2"></div>
      <div class="poem-gradient3"></div>
      <div class="poem-gradient4"></div>
      <div class="poem-gradient6"></div>
      <div class="poem-gradient7"></div>
      <div class="poem-gradient8"></div>
      <div class="poem-gradient9"></div>
    </div>
    <div slot="content">
      <div class="paragraph short">An issuer is someone looking to create a token, a digital representation of value.
        This
        involves two key aspects: the technology for token creation (minting) and ensuring liquidity for trading.
      </div>
      <div class="title-text">Minting and Liquidity</div>
      <div class="paragraph">
        Minting is about using smart contracts, often on platforms like Ethereum, to create tokens. Liquidity, on the
        other hand, ensures there are buyers and sellers in the market. It's akin to having someone ready to buy or sell
        custom surfboards – without enough participants, even a valuable item may struggle to find takers.
      </div>
      <div class="title-text">The Catch-22 Challenge</div>
      <div class="paragraph">
        The challenge lies in a catch-22 situation. Tokens lack liquidity without users, yet users are hesitant if
        liquidity is scarce. The key for issuers is to encourage widespread adoption of their token. For instance, a
        gold token's value isn't just in the gold it represents but in the ease of access within the blockchain system.
      </div>
      <div class="title-text">The Role of Transparency</div>
      <div class="paragraph">
        Transparency is a crucial tool for issuers. In the often opaque world of token creation, being transparent about
        the token's quality during minting builds trust. This is vital in a landscape where many tokens lack clear
        information, making users wary.
      </div>
      <div class="title-text">Beyond Token Creation</div>
      <div class="paragraph">
        To succeed, issuers need more than just a token – they need a compelling narrative. Transparency acts as the
        linchpin, connecting issuers with users, fostering liquidity, and ensuring the token's relevance in the digital
        space.
        <p>
          Issuers must not only focus on creating tokens but also on storytelling and transparency. The success of a
          token ultimately hinges on user confidence and liquidity in the fast-paced world of digital assets.
        </p>
      </div>
    </div>
  </EcosystemsTemplate>
</div>

<style>
    .transparency-container {
        background: #D2D0FF;
        margin-left: auto;
        margin-right: auto;
        position: relative;
        overflow: hidden;
    }

    .paragraph {
        margin-bottom: 40px;
        color: #575757;
        font-family: 'Manrope', sans-serif;
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        max-width: 1500px;
    }

    .paragraph.short {
        max-width: 1000px;
    }

    .poem-gradient1 {
        position: absolute;
        width: 1576px;
        height: 714px;
        border-radius: 1576px;
        background: radial-gradient(50.35% 50.24% at 46.09% 49.91%, #F2F4F6 0%, rgba(242, 244, 246, 0.56) 67.25%, rgba(233, 233, 233, 0.00) 100%);
        top: 465px;
        z-index: 1;
        left: 40%;
    }

    .poem-gradient2 {
        position: absolute;
        width: 1769px;
        height: 1547px;
        border-radius: 1769px;
        background: radial-gradient(50.35% 50.24% at 46.09% 49.91%, #FFF 0%, rgba(245, 245, 245, 0.56) 77.71%, rgba(233, 233, 233, 0.00) 100%);
        top: 240px;
        left: -25%;
        z-index: 2;
    }

    .poem-gradient3 {
        z-index: 2;
        position: absolute;
        top: 620px;
        left: -25%;
        width: 2129px;
        height: 1011px;
        border-radius: 2129px;
        background: radial-gradient(50.35% 50.24% at 46.09% 49.91%, #FFF 0%, rgba(245, 245, 245, 0.56) 67.25%, rgba(233, 233, 233, 0.00) 100%);
    }

    .poem-gradient4 {
        z-index: 1;
        position: absolute;
        left: -30%;
        top: 1014px;
        width: 2396px;
        height: 1252px;
        border-radius: 2396px;
        background: radial-gradient(50.35% 50.24% at 46.09% 49.91%, #BFCDFF 0%, rgba(217, 221, 255, 0.92) 53.13%, rgba(233, 233, 233, 0.00) 100%);
    }

    .poem-gradient6 {
        z-index: 1;
        position: absolute;
        top: 938px;
        left: -30%;
        width: 1576px;
        height: 1378px;
        border-radius: 1576px;
        background: radial-gradient(50% 50% at 50% 50%, #ABC8FF 0%, rgba(144, 211, 249, 0.00) 100%);
    }

    .poem-gradient7 {
        z-index: 0;
        position: absolute;
        top: 1710px;
        left: -25%;
        width: 1576px;
        height: 1378px;
        border-radius: 1576px;
        background: radial-gradient(50.35% 50.24% at 46.09% 49.91%, #FFF 0%, rgba(245, 245, 245, 0.56) 67.25%, rgba(233, 233, 233, 0.00) 100%);
    }

    .poem-gradient8 {
        z-index: 0;
        position: absolute;
        top: 1100px;
        left: 50%;
        width: 1576px;
        height: 1378px;
        border-radius: 1576px;
        background: radial-gradient(50.35% 50.24% at 46.09% 49.91%, #FFF 0%, rgba(245, 245, 245, 0.56) 67.25%, rgba(233, 233, 233, 0.00) 100%);
    }

    .poem-gradient9 {
        z-index: 0;
        position: absolute;
        top: 1390px;
        left: 50%;
        width: 1576px;
        height: 1378px;
        border-radius: 1576px;
        background: radial-gradient(50% 50% at 50% 50%, #90D3F9 0%, rgba(144, 211, 249, 0.00) 100%);
    }

    .poem-gradient10 {
        position: absolute;
        width: 100%;
        height: 150px;
        top: 0;
        z-index: 0;
        display: none;
        background: rgb(104,94,173);
        background: linear-gradient(90deg, rgb(98 129 205) 0%, rgb(98 129 205) 50%, rgb(98 129 205) 81%, rgb(102 130 207) 98%)
    }

    @media only screen and (max-width: 430px) {
        .poem-gradient10 {
            display: flex;
        }
    }

</style>