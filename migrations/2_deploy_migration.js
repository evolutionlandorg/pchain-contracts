const Proxy = artifacts.require('OwnedUpgradeabilityProxy');
const ApostleBase = artifacts.require('ApostleBase');
const ApostleSettingIds = artifacts.require('ApostleSettingIds');
const Gen0Apostle = artifacts.require('Gen0Apostle');
const SettingsRegistry = artifacts.require('SettingsRegistry');
const ObjectOwnershipAuthority = artifacts.require('ObjectOwnershipAuthority');
const ObjectOwnership = artifacts.require('ObjectOwnership');
const InterstellarEncoder = artifacts.require('InterstellarEncoder');
const ApostleBaseAuthority = artifacts.require('ApostleBaseAuthority');

const conf = {
    registry_address: '0x14Ed5C76d2d347309c5B797948b8Fa0950c4bf87',
    landObject_class: 1,
    apostleObject_class: 2,
    //autoBirthFee: 500 * 10 ** 18,
    autoBirthFee:'500000000000000000000',
    //resourceNeededPerLevel: 5 * 10 ** 18,
    resourceNeededPerLevel: '5000000000000000000',
    bidWaitingTime: 10 * 60,
    gen0Limit: 2000
}

let apostleBaseProxy_address;
let gen0ApostleProxy_address;
let objectOwnershipProxy_address;

module.exports = async (deployer, network) => {
    if (network == 'kovan') {
        return;
    }

    deployer.deploy(InterstellarEncoder);
    deployer.deploy(ApostleSettingIds);
    deployer.deploy(Proxy
    ).then(async () => {
        let apostleProxy = await Proxy.deployed();
        apostleBaseProxy_address = apostleProxy.address;
        console.log('ApostleBaseProxy: ', apostleBaseProxy_address);
        await deployer.deploy(ApostleBase);
        await deployer.deploy(Proxy);
    }).then(async () => {
        let gen0ApostleProxy = await Proxy.deployed();
        gen0ApostleProxy_address = gen0ApostleProxy.address;
        console.log('Gen0ApostleProxy: ', gen0ApostleProxy_address);
        await deployer.deploy(Gen0Apostle);
        await deployer.deploy(Proxy);
    }).then(async () => {
        let objectProxy = await Proxy.deployed();
        objectOwnershipProxy_address = objectProxy.address;
        console.log('objectOwnershipProxy: ', objectOwnershipProxy_address);
        await deployer.deploy(ObjectOwnership);

        // deploy authorities
        await deployer.deploy(ObjectOwnershipAuthority, [apostleBaseProxy_address]);
        await deployer.deploy(ApostleBaseAuthority, [gen0ApostleProxy_address]);

        let registry = await SettingsRegistry.at(conf.registry_address);
        let apostleSettingIds = await ApostleSettingIds.deployed();

        // register in registry
        let apostleBaseId = await apostleSettingIds.CONTRACT_APOSTLE_BASE.call();
        await registry.setAddressProperty(apostleBaseId, apostleBaseProxy_address);

        let birthFeeId = await apostleSettingIds.UINT_AUTOBIRTH_FEE.call();
        await registry.setUintProperty(birthFeeId, conf.autoBirthFee);

        let mixTalentId = await apostleSettingIds.UINT_MIX_TALENT.call();
        await registry.setUintProperty(mixTalentId, conf.resourceNeededPerLevel);

        let bidWaitingTimeId = await apostleSettingIds.UINT_APOSTLE_BID_WAITING_TIME.call();
        await registry.setUintProperty(bidWaitingTimeId, conf.bidWaitingTime);

        let interstellarId = await apostleSettingIds.CONTRACT_INTERSTELLAR_ENCODER.call();
        await registry.setAddressProperty(interstellarId, InterstellarEncoder.address);

        console.log("REGISTER DONE!");

        // upgrade
        const proxyApostle = await Proxy.at(apostleBaseProxy_address);
        proxyApostle.upgradeTo(ApostleBase.address);
        const proxyGen0 = await Proxy.at(gen0ApostleProxy_address);
        proxyGen0.upgradeTo(Gen0Apostle.address);
        const proxyOwner = await Proxy.at(objectOwnershipProxy_address);
        proxyOwner.upgradeTo(ObjectOwnership.address);

        //await Proxy.at(apostleBaseProxy_address).upgradeTo(ApostleBase.address);
        //await Proxy.at(clockAuctionProxy_address).upgradeTo(ApostleClockAuction.address);
        //await Proxy.at(gen0ApostleProxy_address).upgradeTo(Gen0Apostle.address);

        console.log("UPGRADE DONE!");

        // initialize
        let apostleBaseProxy = await ApostleBase.at(apostleBaseProxy_address);
        let gen0ApostleProxy = await Gen0Apostle.at(gen0ApostleProxy_address);
        let objectOwnershipProxy = await ObjectOwnership.at(objectOwnershipProxy_address);

        await apostleBaseProxy.initializeContract(registry.address);
        await gen0ApostleProxy.initializeContract(registry.address, conf.gen0Limit);

        console.log("INITIALIZE DONE!");

        // set authority
        await objectOwnershipProxy.setAuthority(ObjectOwnershipAuthority.address);
        await apostleBaseProxy.setAuthority(ApostleBaseAuthority.address);

        console.log("SET AUTHORITY!");

        // register object contract address in interstellarEncoder
        let interstellarEncoder = await InterstellarEncoder.deployed();
        await interstellarEncoder.registerNewTokenContract(conf.objectOwnershipProxy_address);
        await interstellarEncoder.registerNewObjectClass(apostleBaseProxy_address, conf.apostleObject_class);

        console.log('MIGRATION SUCCESS!');

    })
}